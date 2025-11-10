from django.utils import timezone
import json
import os
from core.utils.tasks.collect_market_news import parse_news_date, safe_load_json
from celery import shared_task
from core.models.company_info.company_info import CompanyInfo
from core.models.esg_article_model import ESGArticle
from core.utils.openai_client import client  
from core.models.esg_monthly_report_model import ESGMonthlyReport
import logging
logger = logging.getLogger(__name__)

@shared_task
def fetch_esg_news_dispatcher():
    # Buscar companies e disparar tasks para cada uma
    companies = CompanyInfo.objects.all()
    for company in companies:
        # Chama sem esgnews_type para processar TODOS os tópicos
        fetch_esg_news.delay(company.id)
        logger.info(f"Dispatched ESG news fetch task (all topics) for company ID: {company.id}")

@shared_task
def fetch_esg_news(company_id, esgnews_type=None):

    result = {
        "success": False,
        "company": None,
        "type": "esg",
        "message": "",
        "news_found": 0,
        "news_saved": 0,
        "topics_processed": [],
        "per_topic": {},
    }

    company = CompanyInfo.objects.get(id=company_id)

    try:
        logger.info(f"[{company.short_name}] Fetching and storing ESG news articles...")

        # Conjunto de tópicos: se informado, usa apenas ele; senão, todos do modelo
        topics = [esgnews_type] if esgnews_type else [label for (label, _display) in ESGArticle.TOPIC_CHOICES]

        total_found = 0
        total_saved = 0

        for topic in topics:
            logger.info(f"[{company.short_name}] → Processing topic: {topic}")
            result["topics_processed"].append(topic)

            # Monta input por tópico para o prompt
            input_payload = f"esgnews_type: {topic}"

            response = client.responses.create(
                prompt={'id': os.getenv('OPENAI_PROMPT_ID_ESG_NEWS')},
                input=input_payload,
                store=True,
                include=[
                    "reasoning.encrypted_content",
                    "web_search_call.action.sources"
                ],
                timeout=600
            )

            news_items = safe_load_json(response.output_text)
            if not isinstance(news_items, list) or not news_items:
                logger.warning(f"[{company.short_name}] Nenhuma notícia extraída para o tópico '{topic}'.")
                result["per_topic"][topic] = {"found": 0, "saved": 0}
                continue

            found = len(news_items)
            saved = 0

            for new in news_items:
                raw_date = new.get("esgnews_date")
                date_published = parse_news_date(raw_date)

                try:
                    obj, created = ESGArticle.objects.get_or_create(
                        topic=new.get("esgnews_type") or topic,
                        title=new.get("esgnews_short"),
                        description=new.get("esgnews_description"),
                        url=new.get("esgnews_link"),
                        date_published=date_published
                    )

                    if created:
                        saved += 1
                        logger.info(f"→ Nova notícia salva: {obj.title}")
                    else:
                        logger.info(f"→ Notícia já existente: {obj.title}")

                except Exception as e:
                    logger.exception(f"Erro ao salvar notícia para {company.short_name}: {e}")
                    continue

            total_found += found
            total_saved += saved
            result["per_topic"][topic] = {"found": found, "saved": saved}

        # Atualiza result
        result.update({
            "success": True,
            "message": "Process completed successfully",
            "news_found": total_found,
            "news_saved": total_saved,
        })

        return result

    except Exception as e:
        logger.error(f"Error fetching/storing ESG news: {str(e)}")
        result["message"] = str(e)
        return result
    

#  Task para gerar report mensal das noticias de ESG (Filtro por data de publicação)
@shared_task
def generate_monthly_esg_news_report(company_id):
    
    result = {
        "success": False,
        "company": None,
        "type": "esg_report",
        "message": "",
        "news_found": 0,
        "news_saved": 0,
    }
    
    try:
        company = CompanyInfo.objects.get(id=company_id)
        result["company"] = company.short_name
        logger.info(f"[{company.short_name}] Generating monthly ESG news report...")

        # Determina mês anterior (tratando janeiro -> dezembro do ano anterior)
        now = timezone.now()
        prev_month = 12 if now.month == 1 else now.month - 1
        year = now.year - 1 if now.month == 1 else now.year
        esg_articles = ESGArticle.objects.filter(
            date_published__month=prev_month,
            date_published__year=year
        )
        if not esg_articles.exists():
            logger.warning(f"[{company.short_name}] Nenhuma notícia ESG encontrada para o relatório.")
            result["message"] = "Nenhuma notícia encontrada"
            return result

        logger.info(f"[{company.short_name}] Found {esg_articles.count()} ESG articles for the report.")

        # Prepara input para LLM (como dict)
        input_payload = {
            "esg_articles": [
                {
                    "esgnews_type": article.topic,
                    "esgnews_date": article.date_published.strftime("%d-%m-%Y"),
                    "esgnews_short": article.title,
                    "esgnews_description": article.description,
                    "esgnews_link": article.url,
                }
                for article in esg_articles
            ],
            "report_name": f"ESG_Report_{prev_month:02d}_{year}",
        }
        # Converte o input para string JSON
        input_str = json.dumps(input_payload, ensure_ascii=False)

        response = client.responses.create(
            prompt={'id': os.getenv('OPENAI_PROMPT_ID_ESG_NEWS_REPORT')},
            input=input_str,
            store=True,
            include=["reasoning.encrypted_content", "web_search_call.action.sources"],
            timeout=600,
        )

        report_content = safe_load_json(response.output_text)
        if not isinstance(report_content, dict) or not report_content:
            logger.warning(f"[{company.short_name}] Conteúdo de relatório inválido retornado.")
            result["message"] = "Relatório vazio ou inválido"
            return result
        logger.info(f"[{company.short_name}] ESG News Report Generated")

        raw_date = report_content.get("report_period")
        period_dt = parse_news_date(raw_date) 
        report_period_date = period_dt.date()

        # Persistir / atualizar
        report_obj, created = ESGMonthlyReport.objects.get_or_create(
            company=company,
            report_period=report_period_date,
            defaults={
                "report_name": report_content.get("report_name") or f"ESG_Report_{prev_month:02d}_{year}",
                "report_description": report_content.get("report_description", ""),
            },
        )

        if not created:
            report_obj.report_name = report_content.get("report_name") or report_obj.report_name
            report_obj.report_description = report_content.get("report_description", report_obj.report_description)
            report_obj.report_json = report_content
            report_obj.save()
            logger.info(f"[{company.short_name}] ESG Monthly Report updated: {report_obj.report_name}")
        else:
            logger.info(f"[{company.short_name}] ESG Monthly Report created: {report_obj.report_name}")

        result.update({
            "success": True,
            "message": "Monthly ESG news report generated successfully",
            "report_id": report_obj.id,
            "report_period": report_period_date.strftime("%Y-%m"),
            "report_name": report_obj.report_name,
            "report_content": report_content,
        })
        return result

    except Exception as e:
        logger.error(f"Error generating monthly ESG news report: {e}")
        result.update({
            "success": False,
            "message": f"Failed to generate monthly ESG news report: {e}",
        })
        return result