from typing import Optional
from pydantic import BaseModel
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import status
from openai import OpenAI
from django.db.models import Q
import os
import requests
from datetime import datetime
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from core.models.company_stock_data_model import CompanyStockData
from core.serializers.company_stock_data_serializer import CompanyStockDataSerializer
from rest_framework import serializers
from core.utils.get_company_info import get_company_info
from ..stocks_view import CompanyInfoView
from core.utils.yahoo_finance import YahooFinanceService


class CompanyStockInputSerializer(serializers.Serializer):
    url = serializers.URLField(required=True)
    company_name = serializers.CharField(max_length=255, required=True)
    stock_symbol = serializers.CharField(max_length=10, required=True)
    stock_exchange = serializers.CharField(max_length=10, required=True)


client = OpenAI(api_key=os.getenv('OPENAI_KEY'))

# 1️⃣ Model (Pydantic schema)


class CompanyStockInfo(BaseModel):
    short_term_forecast: Optional[str]
    possible_risk_factors: Optional[str]
    latest_news: Optional[str]


# 2️⃣ Functions
def get_stock_info():
    company = get_company_info()
    symbol = company.stock_symbol

    if not symbol:
        return Response(
            {"error": "Symbol parameter is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    result = YahooFinanceService.get_company_info(symbol)

    if not result["success"]:
        return Response(
            {"error": f"Failed to fetch company info for {symbol}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return result["data"]


def get_usd_to_eur_rate():
    response = requests.get('https://open.er-api.com/v6/latest/USD')
    response.raise_for_status()

    data = response.json()
    return data['rates']['EUR']

# 3️⃣ DRF View/API Endpoint


class OpenAIInvestingDataScraper(APIView):
    # authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        date_today = datetime.now().strftime("%B %d, %Y")
        company = get_company_info()
        stockInfo = get_stock_info()
        print(stockInfo)

        prompt = f"""
        You are a financial consultant specialized in detailed business profiles and market analysis.

        Analyze the current business situation of {company.long_name} ({company.stock_symbol}).  
        Base your answer on the provided company and stock data (see context below) and recent, reliable news—using online research.

        **Your report must contain:**

        1. **Latest Relevant News**
            - Summarize the most important news and market movements about {company.long_name} from the past 7 days.
            - Focus on facts that impact business outlook, reputation, or pricing.

        2. **Short-Term Stock Forecast**
            - Provide a concise prediction for the probable stock movement in the short term (next few weeks).
            - Base your assessment on financial data and recent news.

        3. **Potential Risk Factors**
            - List and briefly explain the top risks or uncertainties that could affect the business or stock price soon.
            - Use both quantitative (financial data) and qualitative (external news, trends) insights.

        **Guidelines:**
        - Only use up-to-date, trustworthy sources.
        - If any data field is missing, try to supplement it using your online search abilities.
        - Avoid unnecessary repetition—do not copy the context or data fields, synthesize your answer into clear narrative paragraphs.
        - Maintain a professional, analytical tone.

        **Context for your analysis:**
        {stockInfo}

        Today's date: {date_today}
        """

        # OpenAI API call beta parse
        completion = client.beta.chat.completions.parse(
            model="gpt-4o-search-preview",
            messages=[
                {"role": "system", "content": (
                    "Utilize the provided financial data to complete the request. "
                    "Also, use additional reliable resources online to provide a comprehensive analysis where specific data is missing or needed."
                )
                },
                {"role": "user", "content": prompt},
            ],
            response_format=CompanyStockInfo,
        )

        content = completion.choices[0].message.parsed
        print(content)

        usd_to_eur = get_usd_to_eur_rate()

        if stockInfo.get('currency') == 'EUR':
            price_eur = stockInfo.get('previousClose')
            cap_eur = stockInfo.get('marketCap')
            price_usd = round(price_eur / usd_to_eur, 4) if price_eur else None
            cap_usd = round(cap_eur / usd_to_eur, 2) if cap_eur else None
        else:
            price_usd = stockInfo.get('previousClose')
            cap_usd = stockInfo.get('marketCap')
            price_eur = round(price_usd * usd_to_eur, 4) if price_usd else None
            cap_eur = round(cap_usd * usd_to_eur, 2) if cap_usd else None

        result = CompanyStockData.objects.create(
            date=date_today,
            company=company.short_name,
            stock_symbol=company.stock_symbol,
            stock_exchange=stockInfo.get('currency'),
            stock_price_today_usd=price_usd,
            stock_price_today_eur=price_eur,
            market_cap_usd=cap_usd,
            market_cap_eur=cap_eur,
            pe_ratio=stockInfo.get('forwardPE'),
            sector=f"{stockInfo.get('industry')},{stockInfo.get('sector')}",
            stock_volatility_level='none',
            short_term_forecast=content.short_term_forecast,
            possible_risk_factors=content.possible_risk_factors,
            latest_news=content.latest_news,
            analyst_recommendation=stockInfo.get('recommendationKey')
        )
        serializer = CompanyStockDataSerializer(result)
        return Response(serializer.data, status=200)

    def get(self, request, *args, **kwargs):
        company = request.query_params.get('company', None)
        start_date = request.query_params.get('start_date', None)
        end_date = request.query_params.get('end_date', None)

        filters = Q()

        if start_date and end_date:
            filters &= Q(created_at__range=[start_date, end_date])
        elif start_date:
            filters &= Q(created_at__gte=start_date)
        elif end_date:
            filters &= Q(created_at__lte=end_date)

        if company:
            filters &= Q(company__iexact=company)
            companies = CompanyStockData.objects.filter(filters)

            if not companies.exists():
                return Response({"detail": "No data found."}, status=404)

            created_at = list(companies.values_list('created_at', flat=True))
            stock_price_usd = list(companies.values_list(
                'stock_price_today_usd', flat=True))
            stock_price_eur = list(companies.values_list(
                'stock_price_today_eur', flat=True))

            latest_data = companies.order_by('-created_at').first()

            response_data = {
                "id": latest_data.id,
                "created_at": created_at,
                "date": latest_data.date,
                "company": latest_data.company,
                "stock_symbol": latest_data.stock_symbol,
                "stock_exchange": latest_data.stock_exchange,
                "stock_price_today_usd": stock_price_usd,
                "stock_price_today_eur": stock_price_eur,
                "market_cap_usd": latest_data.market_cap_usd,
                "market_cap_eur": latest_data.market_cap_eur,
                "pe_ratio": latest_data.pe_ratio,
                "sector": latest_data.sector,
                "stock_volatility_level": latest_data.stock_volatility_level,
                "short_term_forecast": latest_data.short_term_forecast,
                "possible_risk_factors": latest_data.possible_risk_factors,
                "latest_news": latest_data.latest_news,
                "analyst_recommendation": latest_data.analyst_recommendation
            }
            return Response(response_data, status=200)

        else:
            distinct_companies = CompanyStockData.objects.filter(
                filters).values_list('company', flat=True).distinct()
            response_list = []

            for company_name in distinct_companies:
                company_data = CompanyStockData.objects.filter(
                    company=company_name)
                created_at = list(company_data.values_list(
                    'created_at', flat=True))
                stock_price_usd = list(company_data.values_list(
                    'stock_price_today_usd', flat=True))
                stock_price_eur = list(company_data.values_list(
                    'stock_price_today_eur', flat=True))

                latest_data = company_data.order_by('-created_at').first()

                response_data = {
                    "id": latest_data.id,
                    "created_at": created_at,
                    "date": latest_data.date,
                    "company": latest_data.company,
                    "stock_symbol": latest_data.stock_symbol,
                    "stock_exchange": latest_data.stock_exchange,
                    "stock_price_today_usd": stock_price_usd,
                    "stock_price_today_eur": stock_price_eur,
                    "market_cap_usd": latest_data.market_cap_usd,
                    "market_cap_eur": latest_data.market_cap_eur,
                    "pe_ratio": latest_data.pe_ratio,
                    "sector": latest_data.sector,
                    "stock_volatility_level": latest_data.stock_volatility_level,
                    "short_term_forecast": latest_data.short_term_forecast,
                    "possible_risk_factors": latest_data.possible_risk_factors,
                    "latest_news": latest_data.latest_news,
                    "analyst_recommendation": latest_data.analyst_recommendation
                }
                response_list.append(response_data)

            return Response(response_list, status=200)
