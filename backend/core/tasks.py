# core/tasks.py
import os
from core.utils.get_company_info import get_company_info, get_competitors
from core.models.market_article_model import MarketNewsArticle
import re
import requests
from django.utils import timezone
from datetime import datetime, timedelta
from celery import shared_task
from core.utils.cron.market_news import fetch_news_thenewsapi, fetch_news_currentsapi, fetch_news_mediastack

from openai import OpenAI
from pydantic import ValidationError
import os
from datetime import datetime
from core.models.competitor_model import Competitor, CompetitorSearch
from core.utils.get_company_info import get_company_info, get_competitors
from core.models.company_info import CompetitorInfo as CompanyCompetitors
from typing import List
from pydantic import BaseModel


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


@shared_task
