# core/tasks.py
import logging
import os
from core.utils.get_company_info import get_company_info, get_competitors, get_ceos
from core.models.market_article_model import MarketNewsArticle
import re
import requests
from django.utils import timezone
from datetime import datetime, timedelta
from celery import shared_task
from core.utils.cron.market_news import fetch_news_thenewsapi, fetch_news_currentsapi, fetch_news_mediastack

from openai import OpenAI
from pydantic import ValidationError
from core.models.competitor_model import Competitor, CompetitorSearch
from core.models.company_info import CompetitorInfo as CompanyCompetitors
from typing import List
from pydantic import BaseModel

from core.utils.cron.stock import get_usd_to_eur_rate, get_stock_info
from core.models.company_stock_data_model import CompanyStockData
from core.serializers.company_stock_data_serializer import CompanyStockDataSerializer
from typing import Optional

from django.db.models import Q
from core.models.market_company_report import CompanyMarketReport

from core.models.company_quarterly_report import CompanyQuarterlyReport

import json
from core.models.ceo_article_model import CEOArticle
from core.views.openai.ceo_news_view import response_openai_api, get_sentiment_analysis


@shared_task
def minha_task():
    print("Executando função a cada minuto!")
    return True


@shared_task
def collect_market_news(news_type):
    # keys diferentes para cada api!
    NEWS_API_KEY = os.environ.get("NEWSAPI_KEY")
    CURR_NEWSAPI_KEY = os.environ.get("CURR_NEWSAPI_KEY")
    MEDIASTACK_NEWSAPI_KEY = os.environ.get("MEDIASTACK_NEWSAPI_KEY")
    assert news_type in ['sector', 'competitors'], "Invalid news type."

    company = get_company_info()
    company_name = company.short_name
    company_sector = company.sector

    today = timezone.now().date()
    seven_days_ago = today - timedelta(days=7)
    since = seven_days_ago.isoformat()
    start_date = seven_days_ago.strftime("%Y-%m-%dT00:00:00Z")
    date_range = f"{seven_days_ago.strftime('%Y-%m-%d')},{today.strftime('%Y-%m-%d')}"

    q = f'"{company_name}"'
    if news_type == 'competitors':
        competitors = get_competitors()
        terms = []
        for c in competitors:
            if c.name:
                match = re.match(r'^(.+?)\s*\(([^)]+)\)\s*$', c.name)
                if match:
                    name_pure = match.group(1).strip()
                    nickname = match.group(2).strip()
                    terms.append(f'"{name_pure}"')
                    terms.append(f'"{nickname}"')
                else:
                    terms.append(f'"{c.name.strip()}"')
        q = " | ".join(terms)
    elif news_type == 'sector':
        sectors = [s.strip() for s in company_sector.split(',') if s.strip()]
        if sectors:
            q = ' | '.join(f'"{s}"' for s in sectors)
        else:
            q = f'"{company_name}"'

    # busca nas três APIs
    results = []
    results += fetch_news_thenewsapi(q, since, NEWS_API_KEY)
    results += fetch_news_currentsapi(q, start_date, CURR_NEWSAPI_KEY)
    results += fetch_news_mediastack(q, date_range, MEDIASTACK_NEWSAPI_KEY)

    count_saved = 0
    for item in results:
        date_str = item.get("date_published")
        date_published = None
        if date_str:
            try:
                if "T" in date_str:
                    date_published = datetime.fromisoformat(
                        date_str.replace("Z", "+00:00")).date()
                else:
                    date_published = datetime.strptime(
                        date_str[:10], "%Y-%m-%d").date()
            except Exception:
                date_published = None
        if date_published:
            obj, created = MarketNewsArticle.objects.get_or_create(
                company=company_name,
                type=news_type,
                title=item.get("title"),
                defaults={
                    'url': item.get("url"),
                    'date_published': date_published,
                }
            )
            if created:
                count_saved += 1

    return {
        "success": True,
        "company": company_name,
        "type": news_type,
        "message": "Process completed successfully",
        "query": q,
        "news_found": len(results),
        "news_saved": count_saved,
        "details": [
            {"source": "thenewsapi", "count": len(
                fetch_news_thenewsapi(q, since, NEWS_API_KEY))},
            {"source": "currentsapi", "count": len(
                fetch_news_currentsapi(q, since, CURR_NEWSAPI_KEY))},
            {"source": "mediastack", "count": len(
                fetch_news_mediastack(q, since, MEDIASTACK_NEWSAPI_KEY))}
        ],
    }


class CompetitorInfo(BaseModel):
    company: str
    logo: str
    sectors: List[str]
    description: str
    website: str


class CompetitorInfoList(BaseModel):
    date: str
    competitors: List[CompetitorInfo]


@shared_task
def fetch_and_store_competitors():
    client = OpenAI(api_key=os.getenv('OPENAI_KEY'))

    company = get_company_info()
    company_name = company.short_name
    competitors = get_competitors()
    competitor_names = [c.name for c in competitors if c.name]
    competitor_block = "\n".join(competitor_names)

    if not company_name:
        return {"error": "Company name is required."}

    prompt = f"""
    Identify at least 3 and max of 20 major competitors of {company_name}. For each competitor, provide:
    - Company Name
    - Official Logo URL (format: "https://logo.clearbit.com/companydomain.com")
    - Business Sectors (e.g., Technology, Finance, etc.)
    - Brief Description
    - Official Website URL

    Include those competitors:
    {competitor_block}
    """

    try:
        completion = client.beta.chat.completions.parse(
            model="gpt-4o-search-preview",
            messages=[
                {"role": "system", "content": "Extract competitor information from the web."},
                {"role": "user", "content": prompt},
            ],
            response_format=CompetitorInfoList,
        )
        competitor_info = completion.choices[0].message.parsed.model_dump()

        search_record = CompetitorSearch.objects.create(
            company_name=company_name, sector=company.sector)

        for competitor in competitor_info['competitors']:
            Competitor.objects.create(
                search=search_record,
                competitor=competitor['company'],
                logo=competitor['logo'],
                sectors=competitor['sectors'],
                description=competitor['description'],
                website=competitor['website'],
            )

        for competitor in competitor_info['competitors']:
            CompanyCompetitors.objects.get_or_create(
                company=company,
                name=competitor['company'],
                defaults={
                    # "stock_symbol": competitor.get('stock_symbol', ""),
                    "sector": ", ".join(competitor['sectors']) if isinstance(competitor['sectors'], list) else competitor['sectors'],
                    "website": competitor['website'],
                }
            )

        return {
            "date": search_record.search_date.isoformat(),
            "competitors": competitor_info['competitors']
        }

    except ValidationError as e:
        return {"error": str(e)}


class CompanyStockInfo(BaseModel):
    short_term_forecast: Optional[str]
    possible_risk_factors: Optional[str]
    latest_news: Optional[str]


@shared_task
def fetch_and_store_daily_company_stock_data():
    client = OpenAI(api_key=os.getenv('OPENAI_KEY'))

    date_today = datetime.now().strftime("%B %d, %Y")
    company = get_company_info()
    stockInfo = get_stock_info(company)

    if stockInfo is None:
        return {"error": "Failed to fetch stock info."}

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

    return CompanyStockDataSerializer(result).data


SYSTEM_MESSAGE = (
    "You are an advanced deep search AI. Your role is to understand and process "
    "complex queries by dissecting the input, identifying key themes, and "
    "retrieving relevant and precise information. Ensure a thorough search "
    "through multiple data layers and provide well-structured, concise, and "
    "contextually appropriate results. Prioritize clarity, accuracy, and "
    "relevance in all of your responses."
)


@shared_task
def generate_monthly_market_report():
    comp = get_company_info()
    company = comp.short_name

    if not company:
        return {"error": "Company name is required."}

    today = datetime.today()
    last_month = today - timedelta(days=30)

    first_this_month = today.replace(day=1)
    last_month_end = first_this_month - timedelta(days=1)
    first_last_month = last_month_end.replace(day=1)
    month_name = last_month_end.strftime("%B")
    year = last_month_end.strftime("%Y")

    news_titles = MarketNewsArticle.objects.filter(
        Q(company__iexact=company) &
        Q(date_published__gte=first_last_month) &
        Q(date_published__lte=last_month_end)
    ).values_list('title', flat=True)

    # if not news_titles:
    #     return {"error": "No news found for this company in the last month."}

    # titles_text = ' '.join(news_titles)

    message = (
        f"You need to create a monthly report overview for {comp.long_name}. "
        f"specifically for the month of {month_name} {year}. "
        f"The report should summarize the key events, trends, ups and downs, and important data from the last month. "
        "Ensure the summary is concise and covers significant points relevant to the company's performance and market position."
    )

    api_key = os.getenv("PERPLEXITY_KEY")
    if not api_key:
        return {"error": "API Key is missing"}

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    request_body = {
        "model": "sonar-deep-research",
        "messages": [
            {"role": "system", "content": SYSTEM_MESSAGE},
            {"role": "user", "content": message},
        ],
    }

    try:
        response = requests.post(
            "https://api.perplexity.ai/chat/completions",
            headers=headers,
            json=request_body
        )
        response.raise_for_status()
        data = response.json()

        report_content = data.get("choices", [{}])[0].get(
            "message", {}).get("content", "")
        citations = data.get("citations", [])

        if report_content:
            CompanyMarketReport.objects.create(
                company=company,
                report=report_content,
                citations=citations
            )
            return {"report": report_content, "citations": citations}

        return {"error": "Failed to generate report."}

    except requests.RequestException as e:
        return {"error": str(e)}


@shared_task
def generate_company_quarterly_report(quarter: str, year: int):
    company = get_company_info().short_name
    if not company:
        return {"error": "Company name is required."}

    qreport, _ = CompanyQuarterlyReport.objects.get_or_create(
        company=company,
        quarter=quarter,
        year=year
    )

    api_key = os.getenv("PERPLEXITY_KEY")
    if not api_key:
        return {"error": "API Key is missing"}

    prompt = f"""
    You are a financial analyst creating a detailed ‘Insight Report - Performance Aziendale’ for {company} for {qreport.quarter} of {qreport.year}.

    Your task is to access the press releases, financial statements, and form 10-K (when necessary) to obtain key financial data (Revenue, EBIT, Profit, EPS, guidance, etc.) for that period.

    {f'Aditional information: {qreport}' if getattr(qreport, 'form_10k', None) else ''}
    
    Additionally, use other reliable recent sources from the period if necessary to complement your analysis with announcements, product launches, investments, or strategic news released by {qreport.company} around that quarter.

    Your insight report must be clearly structured in two parts:
    1. Highlights Finanziari
    2. Innovazione e Strategia

    Write clearly, professionally and formatted in Italian. Use real numbers, bullet points, and YoY percentage variations.
    """

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    request_body = {
        "model": "sonar-deep-research",
        "messages": [
            {"role": "system", "content": SYSTEM_MESSAGE},
            {"role": "user", "content": prompt},
        ],
    }

    try:
        resp = requests.post(
            "https://api.perplexity.ai/chat/completions",
            headers=headers,
            json=request_body
        )
        resp.raise_for_status()
        data = resp.json()

        insight_report_text = data.get("choices", [{}])[0].get(
            "message", {}).get("content", "")
        citations = data.get("citations", [])

        if not insight_report_text:
            return {"error": "Failed to generate report."}

        qreport.insight_report = insight_report_text
        qreport.citations = citations
        qreport.save()

        return {
            "insight_report": insight_report_text,
            "citations": citations,
            "message": "Insight Report successfully generated and updated via Perplexity."
        }

    except requests.RequestException as e:
        return {"error": str(e)}


logger = logging.getLogger(__name__)


@shared_task
def daily_ceo_articles_fetch():
    ceos = get_ceos()
    if not ceos:
        logger.info("No CEOs found for fetching news articles.")
        return

    leaders = {
        ceo.name: f"{getattr(ceo, 'role', '')} of {getattr(ceo, 'company', '')}" for ceo in ceos}
    num_articles_total = 0

    for ceo in ceos:
        personality = ceo.name
        logger.info(f"Fetching news articles for CEO: {personality}")

        max_retries = 2
        json_content = {"articles": []}
        for attempt in range(max_retries + 1):
            try:
                response = response_openai_api(personality, leaders)
                response_text = ''
                for output in response.output:
                    if output.type == 'message':
                        for content in output.content:
                            if content.type == 'output_text':
                                response_text = content.text

                if response_text == '':
                    response_text = '{"articles":[]}'

                usage = response.usage
                logger.info(
                    f"[{personality}] Tokens: in={usage.input_tokens}, out={usage.output_tokens}")

                try:
                    json_content = json.loads(response_text)
                except json.JSONDecodeError as e:
                    logger.error(
                        f"JSON inválido recebido para {personality}: {response_text}")
                    break

                if 'articles' not in json_content:
                    logger.error(
                        f"[{personality}] Missing 'articles' in OpenAI response: {json_content}")
                    break

                break

            except Exception as e:
                logger.error(
                    f"Erro ao tentar buscar dados para {personality}: {e}")
                if attempt == max_retries:
                    logger.error(
                        f"Falha para {personality} após várias tentativas.")

        created_articles = 0
        for article_data in json_content.get("articles", []):
            sentiment_score = get_sentiment_analysis(
                personality, article_data["content"])
            article, created = CEOArticle.objects.get_or_create(
                title=article_data["title"],
                url=article_data["url"],
                defaults={
                    "personality": personality,
                    "author": article_data.get('author', 'Sconosciuto'),
                    "content": article_data["content"],
                    "source": article_data["source"],
                    "language": article_data["language"],
                    "date_published": article_data["date_published"],
                    "sentiment": sentiment_score
                }
            )
            if created:
                created_articles += 1
                article.sentiment = sentiment_score
                article.save()

        num_articles_total += created_articles
        logger.info(f"{created_articles} articles created for {personality}")

    logger.info(
        f"Daily CEO articles fetch finalizada! Total artigos criados: {num_articles_total}")
