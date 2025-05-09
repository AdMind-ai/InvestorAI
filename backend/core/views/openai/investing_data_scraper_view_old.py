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
from rest_framework import serializers


class CompanyStockInputSerializer(serializers.Serializer):
    url = serializers.URLField(required=True)
    company_name = serializers.CharField(max_length=255, required=True)
    stock_symbol = serializers.CharField(max_length=10, required=True)
    stock_exchange = serializers.CharField(max_length=10, required=True)


client = OpenAI(api_key=os.getenv('OPENAI_KEY'))

# 1️⃣ Model (Pydantic schema)


class CompanyStockInfo(BaseModel):
    date: Optional[str]
    company_name: str
    stock_symbol: str
    stock_exchange: str
    stock_price_today_usd: Optional[float]
    stock_price_today_eur: Optional[float]
    market_cap_usd: Optional[str]
    market_cap_eur: Optional[str]
    pe_ratio: Optional[float]
    sector: Optional[str]
    stock_volatility_level: Optional[str]
    short_term_forecast: Optional[str]
    possible_risk_factors: Optional[str]
    latest_news: Optional[str]
    analyst_recommendation: Optional[str]

# 2️⃣ Functions


def get_usd_to_eur_rate():
    response = requests.get('https://open.er-api.com/v6/latest/USD')
    response.raise_for_status()

    data = response.json()
    return data['rates']['EUR']


def parse_market_cap(market_cap_str):
    multiplier = {'T': 1e12, 'B': 1e9, 'M': 1e6}
    number, unit = market_cap_str.split()
    return float(number) * multiplier[unit]


def convert_market_cap_usd_to_eur(market_cap_usd_str, exchange_rate):
    market_cap_usd_number = parse_market_cap(market_cap_usd_str)
    market_cap_eur_number = market_cap_usd_number * exchange_rate

    if market_cap_eur_number >= 1e12:
        return f"{round(market_cap_eur_number / 1e12, 2)} T"
    elif market_cap_eur_number >= 1e9:
        return f"{round(market_cap_eur_number / 1e9, 2)} B"
    elif market_cap_eur_number >= 1e6:
        return f"{round(market_cap_eur_number / 1e6, 2)} M"
    else:
        return str(round(market_cap_eur_number, 2))

# 3️⃣ DRF View/API Endpoint


class OpenAIInvestingDataScraper(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = CompanyStockInputSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            url = serializer._validated_data.get(
                'url', "https://www.investing.com/equities/apple-computer-inc")
            company_name = serializer._validated_data.get(
                'company', "Apple")
            stock_symbol = serializer._validated_data.get(
                'stock_symbol', "AAPL")
            stock_exchange = serializer._validated_data.get(
                'stock_exchange', "NASDAQ")
            date_today = datetime.now().strftime("%B %d, %Y")

            page_content = ''
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                context = browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36"
                )
                page = context.new_page()
                page.goto(url, wait_until='commit')
                page.wait_for_selector("body")
                print("Yes")
                page_content = page.content()
                # print(page_content)
                browser.close()

            soup = BeautifulSoup(page_content, 'html.parser')

            # CSS Selectors
            price_selector = "#stock-price-today > div.relative.text-sm.leading-6 > div"
            market_cap_selector = "#market-cap > div.relative.text-sm.leading-6 > div"
            pe_ratio_selector = "#__next > div.md\:relative.md\:bg-white > div.relative.flex > div.md\:grid-cols-\[1fr_72px\].md2\:grid-cols-\[1fr_420px\].grid.flex-1.grid-cols-1.px-4.pt-5.font-sans-v2.text-\[\#232526\].antialiased.transition-all.xl\:container.sm\:px-6.md\:gap-6.md\:px-7.md\:pt-10.md2\:gap-8.md2\:px-8.xl\:mx-auto.xl\:gap-10.xl\:px-10 > div.min-w-0 > div.mb-\[30px\].flex.flex-col.items-start.gap-5 > div.hidden.w-full.md\:block > div > div:nth-child(21) > dd > a > span > span:nth-child(2)"

            # Extract news info
            articles = soup.select(
                'ul[data-test="new-and-analysis-list"] li article')
            news_info = []
            for article in articles:
                headline = article.select_one(
                    'a[data-test="article-title-link"]').text.strip()
                publish_date = article.select_one(
                    'time[data-test="article-publish-date"]').text.strip()
                news_info.append({
                    'headline': headline,
                    'publish_date': publish_date
                })
            # print(news_info)

            # Extract ratings info
            total_analysts = soup.select_one(
                '.font-normal.leading-tight').text.strip().split()[0]
            ratings_div_count = soup.select_one(
                '#__next > div.md\:relative.md\:bg-white > div.relative.flex > div.md\:grid-cols-\[1fr_72px\].md2\:grid-cols-\[1fr_420px\].grid.flex-1.grid-cols-1.px-4.pt-5.font-sans-v2.text-\[\#232526\].antialiased.transition-all.xl\:container.sm\:px-6.md\:gap-6.md\:px-7.md\:pt-10.md2\:gap-8.md2\:px-8.xl\:mx-auto.xl\:gap-10.xl\:px-10 > div.min-w-0 > div.flex.w-full.flex-col.gap-5.mb-10.sm\:mb-12 > div > div > div.flex.w-full.flex-row.gap-\[1\.875rem\].border-y.border-\[\#e4eaf1\].md\:w-1\/2 > div.w-full > div:nth-child(1) > div')
            buy_selector = 'div:nth-child(1) > div.text-xs.font-semibold.leading-none.text-\[\#181c21\]'
            buy_count = ratings_div_count.select_one(
                buy_selector).text.strip() if ratings_div_count.select_one(buy_selector) else 0
            hold_selector = 'div:nth-child(2) > div.text-xs.font-semibold.leading-none.text-\[\#181c21\]'
            hold_count = ratings_div_count.select_one(
                hold_selector).text.strip() if ratings_div_count.select_one(hold_selector) else 0
            sell_selector = 'div:nth-child(3) > div.text-xs.font-semibold.leading-none.text-\[\#181c21\]'
            sell_count = ratings_div_count.select_one(
                sell_selector).text.strip() if ratings_div_count.select_one(sell_selector) else 0
            overall_consensus_selector = '#__next > div.md\:relative.md\:bg-white > div.relative.flex > div.md\:grid-cols-\[1fr_72px\].md2\:grid-cols-\[1fr_420px\].grid.flex-1.grid-cols-1.px-4.pt-5.font-sans-v2.text-\[\#232526\].antialiased.transition-all.xl\:container.sm\:px-6.md\:gap-6.md\:px-7.md\:pt-10.md2\:gap-8.md2\:px-8.xl\:mx-auto.xl\:gap-10.xl\:px-10 > div.min-w-0 > div.flex.w-full.flex-col.gap-5.mb-10.sm\:mb-12 > div > div > div.w-full.border-b.border-\[\#e4eaf1\].md\:w-1\/2.md\:border-t > div.border-b.border-\[\#e4eaf1\].py-4 > div > div.relative.px-4.py-1.text-center.text-sm.font-semibold.\!md\:w-fit-content.flex.items-center.justify-center.gap-2\.5.py-1 > div'
            overall_consensus = ratings_div_count.select_one(
                overall_consensus_selector).text.strip() if ratings_div_count.select_one(overall_consensus_selector) else None
            analysts_recommendation = {
                'total_analysts': total_analysts,
                'buy_count': buy_count,
                'hold_count': hold_count,
                'sell_count': sell_count,
                'description': f"Analysts' recommendations are as follows: {total_analysts} analysts rated the stock, with {buy_count} recommending 'Buy', {hold_count} recommending 'Hold', and {sell_count} recommending 'Sell'."
            }

            target_container = soup.select_one(
                '#__next > div.md\:relative.md\:bg-white > div.relative.flex > div.md\:grid-cols-\[1fr_72px\].md2\:grid-cols-\[1fr_420px\].grid.flex-1.grid-cols-1.px-4.pt-5.font-sans-v2.text-\[\#232526\].antialiased.transition-all.xl\:container.sm\:px-6.md\:gap-6.md\:px-7.md\:pt-10.md2\:gap-8.md2\:px-8.xl\:mx-auto.xl\:gap-10.xl\:px-10 > div.min-w-0 > div.flex.w-full.flex-col.gap-5.mb-10.sm\:mb-12 > div > div > div.w-full.border-b.border-\[\#e4eaf1\].md\:w-1\/2.md\:border-t > div:nth-child(2)')
            price_target = target_container.select_one(
                '.text-xl.font-bold.leading-7 span:nth-of-type(2)').text.strip()
            percentage = target_container.select_one(
                '.text-positive-main').text.strip('()% ')
            target_word = target_container.select_one(
                '.text-xl.font-bold.leading-7 span:first-of-type').text.strip()
            stock_forecast = {
                'price_target': float(price_target),
                'percentage': percentage,
                'target_level': target_word,
                'description': f"Analysts expect the stock price to reach a target of U$ {price_target}, categorized as '{target_word}' level, with an expected {percentage} overall."
            }

            # Extract stock info
            stock_price_today_usd = soup.select_one(
                price_selector).text.strip() if soup.select_one(price_selector) else None
            market_cap_usd = soup.select_one(market_cap_selector).text.strip(
            ) if soup.select_one(market_cap_selector) else None
            pe_ratio = soup.select_one(pe_ratio_selector).text.strip(
            ) if soup.select_one(pe_ratio_selector) else None

            # Results
            print("\n\nStock Price Today USD:", stock_price_today_usd)
            print("\nMarket Capitalization USD:", market_cap_usd)
            print("\nP/E Ratio USD:", pe_ratio)
            print("\nNews Articles:\n", news_info)
            print("\nAnalyst Recommendation:\n", analysts_recommendation)
            print("\nStock Forecast:\n", stock_forecast)
            print("\n\n")

            prompt = f"""
            Provide a detailed analysis for {company_name} ({stock_symbol}) using the extracted data. 
            Information includes:

            - **Today's stock price**: {stock_price_today_usd} (Use extrictly this value.)
            - **Market Capitalization (Market Cap)**: {market_cap_usd} (Use extrictly this value.) (Format: "3.22 T", "455.23 B", "22.45 M", etc. (Abbreviations: T for trillion, B for billion, M for million))
            - **Price-to-Earnings Ratio (P/E Ratio)**: {pe_ratio} (Use extrictly this value.)
            - **Latest relevant news**: \n{news_info}\n\n
            - **Analyst Rating Recommendation**: Based on {analysts_recommendation}, describe whether consensus is 'Buy', 'Hold', or 'Sell'. 
                Ensure each recommendation has a concise explanation:
                    - "Buy": Indicates that analysts expect the stock's price to increase and consider it a good investment opportunity.
                    - "Strong Buy": Suggests a particularly high confidence in the stock's potential to rise, often backed by strong fundamentals or recent positive developments.
                    - "Sell": Analysts recommend selling the stock, anticipating a decline in value or performance issues.
                    - "Strong Sell": Indicates an expectation of significant decline, often due to fundamental weaknesses or adverse conditions.
                    - "Hold": Suggests maintaining the current position, anticipating stability or waiting for more information before making a move.
            - **Stock Volatility Level**: \n{stock_forecast}\n
            - **Business Sector of {company_name}**
            - **Short-term Forecast**: Use {stock_forecast} and recent news as well to provide a succinct stock trajectory forecast.
            - **Risk Factors**: Use extracted and online data to outline potential risks affecting the business.
            
            Context:
                - Company: {company_name}
                - Stock symbol: {stock_symbol}
                - Exchange: {stock_exchange}
                - Today's date: {date_today}

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

            # ✅ Conversions USD -> EUR
            if content.stock_price_today_usd:
                content.stock_price_today_eur = round(
                    content.stock_price_today_usd * usd_to_eur, 2)
            else:
                content.stock_price_today_eur = None

            if content.market_cap_usd:
                content.market_cap_eur = convert_market_cap_usd_to_eur(
                    content.market_cap_usd, usd_to_eur)
            else:
                content.market_cap_eur = None

            content.date = date_today
            content.company_name = company_name
            content.stock_symbol = stock_symbol
            content.stock_exchange = stock_exchange

            CompanyStockData.objects.create(
                date=content.date,
                company=content.company_name,
                stock_symbol=content.stock_symbol,
                stock_exchange=content.stock_exchange,
                stock_price_today_usd=content.stock_price_today_usd,
                stock_price_today_eur=content.stock_price_today_eur,
                market_cap_usd=content.market_cap_usd,
                market_cap_eur=content.market_cap_eur,
                pe_ratio=content.pe_ratio,
                sector=content.sector,
                stock_volatility_level=content.stock_volatility_level,
                short_term_forecast=content.short_term_forecast,
                possible_risk_factors=content.possible_risk_factors,
                latest_news=content.latest_news,
                analyst_recommendation=content.analyst_recommendation
            )

            return Response(content, status=200)
        else:
            return Response(
                serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )

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
