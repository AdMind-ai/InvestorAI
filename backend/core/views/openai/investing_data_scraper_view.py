from typing import Optional
from pydantic import BaseModel
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework_simplejwt.authentication import JWTAuthentication
from openai import OpenAI
import os
import requests
from datetime import datetime
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

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

    def get(self, request, *args, **kwargs):
        url = "https://www.investing.com/equities/apple-computer-inc"
        company_name = "Apple"
        stock_symbol = "AAPL"
        stock_exchange = "NASDAQ"
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

        return Response(content, status=200)
