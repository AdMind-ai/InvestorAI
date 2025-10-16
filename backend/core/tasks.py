# core/tasks.py
from core.models.openai_ceo_conversaitons_model import CEOConversation
from core.models.company_info import CEO
import time
from openai import BadRequestError
from django.conf import settings
import tempfile
from core.utils.quickdoc.upload_to_blob_storage import upload_to_blob_storage
from azure.storage.blob import BlobServiceClient
from core.utils.deepl_translation import DeeplTranslation
import logging
import os
from core.utils.get_company_info import get_competitors
from core.models.company_info.company_info import CompanyInfo
from core.models.market_article_model import MarketNewsArticle
import requests
from django.db import IntegrityError
from datetime import datetime, timedelta, timezone
from celery import shared_task

from openai import OpenAI
from pydantic import ValidationError
from core.models.competitor_model import Competitor, CompetitorSearch
from core.models.company_info import CompetitorInfo as CompanyCompetitors
from typing import List
from pydantic import BaseModel
from django.db import transaction

from core.utils.cron.stock import get_usd_to_eur_rate, get_stock_info
from core.models.company_stock_data_model import CompanyStockData
from core.serializers.company_stock_data_serializer import CompanyStockDataSerializer
from typing import Optional

from core.models.market_company_report import CompanyMarketReport

from core.models.company_quarterly_report import CompanyQuarterlyReport

import json
from core.models.ceo_article_model import CEOArticle
from core.utils.cron.ceo_news import  get_sentiment_analysis

from core.models.esg_article_model import ESGArticle
from core.utils.cron.esg_news import generate_openai_system, generate_openai_prompt

from core.models.openai_chat_models import ChatMessage
from core.models.company_info import CompetitorInfo

from core.utils.tasks.collect_market_news import parse_news_date, safe_load_json

client = OpenAI(api_key=os.getenv('OPENAI_KEY'))

@shared_task
def minha_task():
    print("Executando função a cada minuto!")
    return True

@shared_task(bind=True)
def collect_market_news(self, news_type):
    assert news_type in ["sector", "competitors"], "Invalid news type."

    companies = CompanyInfo.objects.all()
    total_subtasks = 0

    for company in companies:
        if news_type == "sector":
            # dispara só por empresa
            collect_market_news_for_company.delay(company.id, news_type)
            total_subtasks += 1

        elif news_type == "competitors":
            # busca competidores dessa empresa
            competitors = CompetitorInfo.objects.filter(
                company=company
            ).exclude(website__isnull=True).exclude(website="")

            if competitors.exists():
                logger.info(f"[{company.short_name}] Found {competitors.count()} competitors:")
                for competitor in competitors:
                    logger.info(f"  - Competitor: {competitor.name}, Website: {competitor.website}")
                    collect_market_news_for_company.delay(
                        company.id,
                        news_type,
                        competitor_website=competitor.website
                    )
                    total_subtasks += 1
            else:
                logger.info(f"[{company.short_name}] No competitors with website found.")

    logger.info(f"All companies queued for type {news_type} | Total subtasks: {total_subtasks}")

    return {
        "success": True,
        "news_type": news_type,
        "total_companies": companies.count(),
        "total_subtasks": total_subtasks,
        "message": "Subtasks dispatched successfully"
    }



@shared_task(bind=True)
def collect_market_news_for_company(self, company_id, news_type, competitor_website=None):
    assert news_type in ['sector', 'competitors'], "Invalid news type."

    result_all = []

    company = CompanyInfo.objects.get(id=company_id)
    company_name = company.short_name

    # 🔹 Determina qual website usar
    if news_type == "competitors" and competitor_website:
        target_name = f"{company_name} -> Competitors"
        target_website = competitor_website
    else:
        target_name = f"{company_name} -> Sector"
        target_website = company.website

    # Define prompt id 
    prompt_map = { 
        "competitors": "pmpt_68b5a08bc1f08195aa76746f6d01a75e093261f8da3ced76", 
        "sector": "pmpt_68b599d24c7c819795d597fd702235020938a2d476c94ab6", 
    } 
    prompt_id = prompt_map[news_type]
    
    # Fetch news logic
    response = client.responses.create(
        model="gpt-5",
        prompt={'id': prompt_id},
        input=target_website,
        store=True,
        include=[
            "reasoning.encrypted_content",
            "web_search_call.action.sources"
        ],
        timeout=600
    )
    
    news = response.output_text
    logger.info(f"[{target_name}] Fetched news, length={len(news)})")
    
    # Extracting informations 
    response = client.responses.create(
        model="gpt-5",
        prompt={'id': 'pmpt_68b5958d764881959cf2c6e192ba4da00eeba3ba887f8827'}, 
        input=news,
        store=True,
        include=[
            "reasoning.encrypted_content",
            "web_search_call.action.sources"
        ],
        timeout=600
    )
    
    raw_output = response.output_text
    logger.info(f"[{target_name}] Extraction done, raw length={len(raw_output)})")
    
    extracted_info = safe_load_json(raw_output)
    
    if not isinstance(extracted_info, list) or extracted_info == []:
        logger.error(f"[{target_name}] Extraction failed or returned empty list.")
        result_all.append({
            "success": False,
            "company": company_name,
            "target": target_website,
            "type": news_type,
            "message": "Extraction failed or returned empty list.",
            "news_found": 0,
            "news_saved": 0,
        })
        return result_all
        
    # 🔹 Lógica de contagem
    news_found = len(extracted_info)
    news_saved = 0

    for new in extracted_info:
        raw_date = new.get("date_published")
        date_published = parse_news_date(raw_date)

        obj, created = MarketNewsArticle.objects.get_or_create(
            title=new['title'],
            url=new['url'],
            company_fk=company,
            defaults={
                "company": company.long_name,
                "type": news_type,
                "date_published": date_published,
            }
        )

        if created:
            news_saved += 1

    logger.info(f"[{target_name}] Task finished, saved={news_saved}")
    result_all.append({
        "success": True,
        "company": company_name,
        "target": target_website,
        "type": news_type,
        "message": "Process completed successfully",
        "news_found": news_found,
        "news_saved": news_saved,
    })

    return result_all


class CompetitorInfoSchema(BaseModel):
    company: str
    logo: str
    sectors: List[str]
    description: str
    website: str
    stock_symbol: str


class CompetitorInfoListSchema(BaseModel):
    date: str
    competitors: List[CompetitorInfoSchema]


@shared_task
def fetch_and_store_competitors():
    results = []
    for company in CompanyInfo.objects.all():
        company_name = company.short_name
        competitors = get_competitors(company)
        competitor_names = [c.name for c in competitors if c.name]
        competitor_block = "\n".join(competitor_names)

        if not company_name:
            results.append(
                {"company": company.long_name, "error": "Company name is required."})
            continue

        prompt = f"""
        Identify at least 3 and max of 20 major competitors of {company_name}. For each competitor, provide:
        - Company Name
        - Official Logo URL (format: "https://logo.clearbit.com/companydomain.com")
        - Business Sectors (e.g., Technology, Finance, etc.)
        - Brief Description
        - Official Website URL
        - stock_symbol (if exists, else empty)

        Include those competitors:
        {competitor_block}
        """

        try:
            completion = client.beta.chat.completions.parse(
                model="gpt-4o-search-preview",
                messages=[
                    {"role": "system",
                        "content": "Extract competitor information from the web."},
                    {"role": "user", "content": prompt},
                ],
                response_format=CompetitorInfoListSchema,
            )
            competitor_info = completion.choices[0].message.parsed.model_dump()

            search_record = CompetitorSearch.objects.create(
                company_name=company_name,
                sector=company.sector
            )

            competitors_returned = []
            for competitor in competitor_info['competitors']:
                comp_instance = Competitor.objects.create(
                    search=search_record,
                    competitor=competitor['company'],
                    logo=competitor['logo'],
                    sectors=competitor['sectors'],
                    description=competitor['description'],
                    website=competitor['website'],
                )
                competitors_returned.append({
                    "company": comp_instance.competitor,
                    "logo": comp_instance.logo,
                    "sectors": comp_instance.sectors,
                    "description": comp_instance.description,
                    "website": comp_instance.website,
                })

            for competitor in competitor_info['competitors']:
                company_kwargs = {
                    "company": company,
                    "name": competitor.get('company'),
                    "stock_symbol": competitor.get('stock_symbol', ''),
                    "sectors_company": company.sector or '',
                    "website": competitor.get('website', ''),
                    "logo": competitor.get('logo', ''),
                    "sectors_competitor": competitor.get('sectors', []),
                    "description": competitor.get('description', ''),
                }
                obj, created = CompanyCompetitors.objects.get_or_create(
                    company=company,
                    name=company_kwargs['name'],
                    defaults=company_kwargs
                )
                if not created:
                    for k, v in company_kwargs.items():
                        setattr(obj, k, v)
                    obj.save()

            results.append({
                "success": True,
                "company": company_name,
                "date": search_record.search_date.isoformat(),
                "competitors": competitors_returned,
                "message": "Competitor search completed successfully."
            })

        except ValidationError as e:
            results.append(
                {"success": False, "company": company_name, "error": str(e)})
        except Exception as e:
            results.append(
                {"success": False, "company": company_name, "error": str(e)})

    return results


class CompanyStockInfo(BaseModel):
    short_term_forecast: Optional[str]
    possible_risk_factors: Optional[str]
    latest_news: Optional[str]


@shared_task
def fetch_and_store_daily_company_stock_data():
    results = []
    date_today = datetime.now().strftime("%B %d, %Y")
    usd_to_eur = get_usd_to_eur_rate()

    for company in CompanyInfo.objects.all():
        # >> Pular se não tiver stock_symbol
        if not company.stock_symbol:
            results.append({
                "success": False,
                "company": company.short_name,
                "error": "Skipped: company has no stock_symbol."
            })
            continue

        stockInfo = get_stock_info(company)
        if stockInfo is None:
            results.append({
                "success": False,
                "company": company.short_name,
                "error": "Failed to fetch stock info."
            })
            continue

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

        try:
            completion = client.beta.chat.completions.parse(
                model="gpt-4o-search-preview",
                messages=[
                    {"role": "system", "content": (
                        "Utilize the provided financial data to complete the request. "
                        "Also, use additional reliable resources online to provide a comprehensive analysis where specific data is missing or needed."
                    )},
                    {"role": "user", "content": prompt},
                ],
                response_format=CompanyStockInfo,
            )

            content = completion.choices[0].message.parsed

            if stockInfo.get('currency') == 'EUR':
                price_eur = stockInfo.get('previousClose')
                cap_eur = stockInfo.get('marketCap')
                price_usd = round(price_eur / usd_to_eur,
                                  4) if price_eur else None
                cap_usd = round(cap_eur / usd_to_eur, 2) if cap_eur else None
            else:
                price_usd = stockInfo.get('previousClose')
                cap_usd = stockInfo.get('marketCap')
                price_eur = round(price_usd * usd_to_eur,
                                  4) if price_usd else None
                cap_eur = round(cap_usd * usd_to_eur, 2) if cap_usd else None

            stock_data = CompanyStockData.objects.create(
                date=date_today,
                company=company,
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

            results.append({
                "success": True,
                "company": company.short_name,
                "data": CompanyStockDataSerializer(stock_data).data,
                "message": "Stock data fetched and saved successfully.",
            })
        except Exception as e:
            results.append({
                "success": False,
                "company": company.short_name,
                "error": str(e)
            })

    return results


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
    results = []
    today = datetime.today()
    first_this_month = today.replace(day=1)
    last_month_end = first_this_month - timedelta(days=1)
    first_last_month = last_month_end.replace(day=1)
    month_name = last_month_end.strftime("%B")
    year = last_month_end.strftime("%Y")

    api_key = os.getenv("PERPLEXITY_KEY")
    if not api_key:
        return {"error": "API Key is missing"}

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    for comp in CompanyInfo.objects.all():
        # >> Pular empresas sem nome curto!
        if not comp.short_name:
            results.append({
                "success": False,
                "company": "",
                "error": "Company short_name is required."
            })
            continue

        sources_list = [s for s in (
            comp.sources or "").splitlines() if s.strip()]
        if not sources_list:
            results.append({
                "success": False,
                "company": comp.short_name,
                "error": "No sources registered for this company."
            })
            continue

        news_titles = MarketNewsArticle.objects.filter(
            company=comp,
            date_published__gte=first_last_month,
            date_published__lte=last_month_end
        ).values_list('title', flat=True)

        # Ativar este filtro para retornar erro se não achou notícias
        # if not news_titles:
        #     results.append({
        #         "success": False,
        #         "company": comp.short_name,
        #         "error": "No news found for this company in the last month."
        #     })
        #     continue

        sources_text = "\n".join(sources_list)
        message = (
            f"You need to create a monthly report overview for {comp.long_name}. "
            f"specifically for the month of {month_name} {year}. "
            f"Use the following sources as your main reference:\n{sources_text}\n\n"
            f"The report should summarize the key events, trends, ups and downs, and important data from the last month. "
            "Ensure the summary is concise and covers significant points relevant to the company's performance and market position."
        )

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
                    company=comp,
                    report=report_content,
                    citations=citations
                )
                results.append({
                    "success": True,
                    "company": comp.short_name,
                    "report": report_content,
                    "citations": citations,
                    "message": "Report generated successfully."
                })
            else:
                results.append({
                    "success": False,
                    "company": comp.short_name,
                    "error": "Failed to generate report."
                })

        except requests.RequestException as e:
            results.append({
                "success": False,
                "company": comp.short_name,
                "error": str(e)
            })

    return results


@shared_task
def generate_company_quarterly_report(quarter: str, year: int):
    api_key = os.getenv("PERPLEXITY_KEY")
    if not api_key:
        return {"error": "API Key is missing"}

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    results = []

    for company in CompanyInfo.objects.all():
        if not company.short_name:
            results.append({
                "success": False,
                "company": "",
                "error": "Company name is required."
            })
            continue

        sources_list = [s for s in (
            company.sources or "").splitlines() if s.strip()]
        if not sources_list:
            results.append({
                "success": False,
                "company": company.short_name,
                "error": "No sources registered for this company."
            })
            continue

        qreport, _ = CompanyQuarterlyReport.objects.get_or_create(
            company=company.long_name,
            quarter=quarter,
            year=year
        )

        sources_text = "\n".join(sources_list)
        prompt = f"""
        You are a financial analyst creating a detailed ‘Insight Report - Performance Aziendale’ for {company.short_name} for {qreport.quarter} of {qreport.year}.

        Your task is to access the press releases, financial statements, and form 10-K (when necessary) to obtain key financial data (Revenue, EBIT, Profit, EPS, guidance, etc.) for that period.
        
        Use the following sources as your main reference:
        {sources_text}
        
        Additionally, use other reliable recent sources from the period if necessary to complement your analysis with announcements, product launches, investments, or strategic news released by {qreport.company} around that quarter.

        Your insight report must be clearly structured in two parts:
        1. Highlights Finanziari
        2. Innovazione e Strategia

        Write clearly, professionally and formatted in Italian. Use real numbers, bullet points, and YoY percentage variations.
        """

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
                results.append({
                    "success": False,
                    "company": company.short_name,
                    "error": "Failed to generate report."
                })
                continue

            qreport.insight_report = insight_report_text
            qreport.citations = citations
            qreport.save()

            results.append({
                "success": True,
                "company": company.short_name,
                "quarter": quarter,
                "year": year,
                "insight_report": insight_report_text,
                "citations": citations,
                "message": "Insight Report successfully generated and updated via Perplexity."
            })

        except requests.RequestException as e:
            results.append({
                "success": False,
                "company": company.short_name,
                "error": str(e),
            })

    return results


logger = logging.getLogger(__name__)

@shared_task(bind=True)
def fetch_ceo_news(self, ceo_name, company_short_name, company_url):
    """
    Busca artigos sobre o CEO utilizando a OpenAI Responses API com prompt_id fixo.
    """
    try:
        logger.info(f"🔍 Buscando notícias para {ceo_name} ({company_url})")

        company_instance = CompanyInfo.objects.filter(short_name=company_short_name).first()
        if not company_instance:
            raise ValueError(f"CEO '{ceo_name}' não encontrado.")
        
        ceo_instance = CEO.objects.filter(name=ceo_name).first()
        if not ceo_instance:
            raise ValueError(f"CEO '{ceo_name}' não encontrado.")
        
        ceo_conversation, created = CEOConversation.objects.get_or_create(
            company=company_instance,
            ceo=ceo_instance,
        )
        
        # Garante que exista uma conversation_id válida
        if ceo_conversation.conversation_id:
            conversation_id = ceo_conversation.conversation_id
        else:
            new_conversation = client.conversations.create()
            conversation_id = new_conversation.id
            ceo_conversation.conversation_id = conversation_id
            ceo_conversation.save(update_fields=["conversation_id"])
            
        ceoInfos = f""""
                Name: {ceo_name}
                Company: {company_short_name}
                Company website: {company_url}
                """
                
        MAX_RETRIES = 10
        RETRY_DELAY = 12

        for attempt in range(MAX_RETRIES):
            try:
                response = client.responses.create(
                    prompt={"id": "pmpt_68efa0da10588196810d96200a9f2c2e0f34a64f34f6ce35"},
                    input=ceoInfos,
                    conversation=conversation_id,
                    store=True,
                    timeout=900,
                )
                break  # deu certo, sai do loop

            except BadRequestError as e:
                if "conversation_locked" in str(e):
                    logger.warning(f"🕒 Conversa bloqueada (tentativa {attempt+1}/{MAX_RETRIES}), esperando...")
                    time.sleep(RETRY_DELAY)
                    continue
                raise
            
        # Extrair o texto JSON da resposta
        response_text = ""
        for output in response.output:
            if output.type == "message":
                for content in output.content:
                    if content.type == "output_text":
                        response_text += content.text

        # Garantir JSON válido
            raw_output = response.output_text
            
            logger.info(f"[Search done, raw length={len(raw_output)})")
            jsonRes = safe_load_json(raw_output)

            # Garante que o formato esteja correto
            results = jsonRes.get("results", [])
            logger.info(f"📰 {len(results)} artigos encontrados para {ceo_name}")

            created_count = 0
        for article in results:
                sentiment = get_sentiment_analysis(ceo_name, article["content"])

                try:
                    with transaction.atomic():
                        obj, created = CEOArticle.objects.get_or_create(
                            title=article["title"],
                            url=article["source"],
                            defaults={
                                "content": article["content"],
                                "date_published": article["date_published"],
                                "sentiment": sentiment,
                                "personality": ceo_instance,
                            },
                        )
                        if created:
                            created_count += 1
                except IntegrityError:
                    logger.info(f"⚠️ Duplicado ignorado: {article['title']}")


        logger.info(f"✅ {created_count} novos artigos criados para {ceo_name}")

        return {"ceo": ceo_name, "created": created_count}

    except Exception as e:
        logger.error(f"❌ Erro ao buscar notícias para {ceo_name}: {e}", exc_info=True)
        return {"ceo": ceo_name, "error": str(e)}


@shared_task(bind=True)
def collect_ceo_news_task(self):
    """
    Task semanal — busca notícias de todos os CEOs cadastrados.
    Retorna uma lista com os IDs das subtasks (uma por CEO).
    """
    logger.info("🚀 Iniciando tarefa semanal de busca de notícias de CEOs")

    subtask_ids = []

    try:
        for company in CompanyInfo.objects.prefetch_related("ceos").all():
            for ceo in company.ceos.all():
                task = fetch_ceo_news.delay(ceo.name, company.short_name, company.website)
                subtask_ids.append(task.id)

        logger.info(f"🏁 Tarefa semanal concluída. Total subtasks: {len(subtask_ids)}")
        return {"total": len(subtask_ids), "subtasks": subtask_ids}

    except Exception as e:
        logger.error(f"❌ Erro na task semanal: {e}", exc_info=True)
        return {"error": str(e), "subtasks": subtask_ids}


@shared_task
def fetch_all_esg_topics_daily():
    total_created = 0
    for topic in ESG_TOPICS:
        logger.info(f"Fetching ESG articles for topic: {topic}")
        max_retries = 2
        json_content = {"articles": []}
        for attempt in range(max_retries + 1):
            try:
                completion = client.chat.completions.create(
                    model="gpt-4o-search-preview",
                    messages=[
                        {"role": "system", "content": generate_openai_system()},
                        {"role": "user",
                            "content": generate_openai_prompt(topic)},
                    ],
                    max_tokens=16000
                )
                content = completion.choices[0].message.content
                try:
                    json_content = json.loads(content)
                except json.JSONDecodeError as e:
                    logger.error(
                        f"(ESG-{topic}) JSON inválido recebido: {content}")
                    break
                if 'articles' not in json_content:
                    logger.error(
                        f"(ESG-{topic}) Campo 'articles' ausente: {json_content}")
                    break
                break
            except Exception as e:
                logger.error(f"(ESG-{topic}) Erro ao tentar buscar dados: {e}")
                if attempt == max_retries:
                    logger.error(f"(ESG-{topic}) Falha após várias tentativas")
                    continue

        created_articles = 0
        for article_data in json_content.get("articles", []):
            article, created = ESGArticle.objects.get_or_create(
                title=article_data["title"],
                url=article_data["url"],
                defaults={
                    "topic": topic,
                    "author": article_data.get('author', 'Sconosciuto'),
                    "summary": article_data["summary"],
                    "source": article_data["source"],
                    "language": article_data["language"],
                    "date_published": article_data["date_published"]
                }
            )
            if created:
                created_articles += 1
        logger.info(f"(ESG-{topic}) Artigos criados: {created_articles}")
        total_created += created_articles
    logger.info(
        f"fetch_all_esg_topics_daily FINALIZADO. Total criados: {total_created}")


@shared_task
def deep_search_perplexity_async(conversation_id, message_id, company):
    """
    Task assíncrona para consultar Perplexity e atualizar a mensagem do chat.
    """
    api_key = os.getenv("PERPLEXITY_KEY")
    if not api_key:
        logger.error("PERPLEXITY_KEY não configurada.")
        _update_message(message_id, "(Falha: API Key não configurada)")
        return

    user_message = f"Please give me a deep overview about the company {company}, listed in the Italian Stock Market, stock price and general overview for the last 24 hours. Please answer in Italian language."

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    request_body = {
        "model": "sonar-deep-research",
        "messages": [
            {"role": "system", "content": SYSTEM_MESSAGE},
            {"role": "user", "content": user_message},
        ],
        "stream": False
    }

    try:
        logger.info(
            f"Iniciando Deep Search para chat {conversation_id}: {company}")
        response = requests.post(
            "https://api.perplexity.ai/chat/completions",
            headers=headers,
            json=request_body,
            timeout=(10, 600)
        )
        response.raise_for_status()
    except requests.exceptions.RequestException as ex:
        logger.error(f"Deep Search RequestException: {ex}")
        _update_message(message_id, f"Erro: {str(ex)}")
        return

    try:
        result = response.json()
        print(result)
        citations = result.get("citations", [])
        choices = result.get("choices", [])
        if choices:
            resposta = choices[0].get("message", {}).get("content", "")
        else:
            resposta = "(No response from Perplexity API)"
            citations = []
    except Exception as ex:
        logger.error(f"Erro ao processar resposta do Perplexity: {ex}")
        resposta = "(Erro ao processar resposta)"

    # Atualizar a mensagem "placeholder" do chat
    _update_message(message_id, resposta, citations)


def _update_message(message_id, content, citations):
    """
    Atualiza o conteúdo de uma mensagem específica do chat.
    """
    try:
        message = ChatMessage.objects.get(id=message_id)
        message.content = content
        message.citations = citations or []
        message.created_at = timezone.now()
        message.save()
    except Exception as ex:
        logger.error(f"Erro ao atualizar mensagem do chat: {ex}")


@shared_task
def async_translate_file(deepl_key, blob_name, target, origin, filename_no_ext=None):
    # blob_name: ex "usuario/uuid_nomeoriginal.pdf"
    user_folder = os.path.dirname(blob_name)        # "usuario"
    base_name = os.path.basename(blob_name)         # "uuid_nomeoriginal.pdf"
    filename_wo_ext, ext = os.path.splitext(base_name)

    # 1. Baixar do Blob para arquivo temporário local
    blob_service_client = BlobServiceClient.from_connection_string(
        settings.AZURE_CONNECTION_STRING)
    blob_client = blob_service_client.get_blob_client(
        container=settings.AZURE_CONTAINER_NAME, blob=blob_name)

    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
        temp_file.write(blob_client.download_blob().readall())
        temp_file.flush()
        temp_path = temp_file.name

    # 2. Traduzir para temp file (gera arquivo FÍSICO local)
    with open(temp_path, 'rb') as f:
        translation = DeeplTranslation(deepl_key)
        translated_file_path = translation.translate_file(
            f, target, origin, filename_no_ext)

    # 3. Criar caminho final do arquivo traduzido com extensão
    translated_file_name = os.path.basename(
        translated_file_path)
    translated_blob_name = f"{user_folder}/{translated_file_name}"

    # 4. Subir arquivo traduzido para o BLOB
    with open(translated_file_path, 'rb') as f:
        translated_url = upload_to_blob_storage(f, translated_blob_name)

    # 5. Limpar arquivos temporários
    try:
        os.remove(temp_path)
    except Exception:
        pass
    try:
        os.remove(translated_file_path)
    except Exception:
        pass

    # 6. Retornar a URL já com SAS
    return translated_url
