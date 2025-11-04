from celery import shared_task
from core.models.company_info import CompanyInfo
import logging
from openai import OpenAI
import os
from core.models.market_article_model import MarketNewsArticle, MarketNewsSetup
from core.models.company_info.competitor import RelatedCompany
from core.utils.tasks.collect_market_news import parse_news_date, safe_load_json

logger = logging.getLogger(__name__)
client = OpenAI(api_key=os.getenv('OPENAI_KEY'))


# ================================================================
# Task orquestradora — decide quais empresas processar
# ================================================================
@shared_task(bind=True)
def fetch_market_competitors_dispatcher(self, company_id=None):
    """
    Orquestra a criação de subtasks Celery para buscar notícias de competidores.
    - Se 'company_id' for informado → dispara task para apenas essa empresa.
    - Caso contrário → dispara tasks para todas as empresas.
    """
    try:
        if company_id:
            companies = CompanyInfo.objects.filter(id=company_id)
        else:
            companies = CompanyInfo.objects.all()

        total = companies.count()
        logger.info(f"[MarketCompetitorsNews] Iniciando dispatcher para {total} empresa(s).")

        dispatched = []
        for company in companies:
            fetch_market_competitors_news_task.delay(company.id)
            dispatched.append(company.long_name)

        logger.info(f"[MarketCompetitorsNews] {len(dispatched)} subtasks criadas com sucesso.")
        return {
            "success": True,
            "dispatched_count": len(dispatched),
            "companies": dispatched
        }

    except Exception as e:
        logger.exception(f"Erro ao despachar tasks de competidores: {e}")
        return {
            "success": False,
            "error": str(e)
        }


# ================================================================
# Task individual — busca e salva notícias de competidores
# ================================================================
@shared_task(bind=True)
def fetch_market_competitors_news_task(self, company_id):
    """
    Busca e salva notícias de mercado relacionadas aos competidores de uma empresa.
    """
    result = {
        "success": False,
        "company": None,
        "type": "competitors",
        "message": "",
        "news_found": 0,
        "news_saved": 0,
    }

    try:
        company = CompanyInfo.objects.get(id=company_id)
        result["company"] = company.long_name

        setup = MarketNewsSetup.objects.filter(company=company).first()
        if not setup or not setup.is_configured:
            msg = f"Empresa {company.long_name} não possui setup configurado."
            logger.info(msg)
            result["message"] = msg
            return result

        logger.info(f"→ Buscando notícias de competidores para {company.long_name}...")
        entities = RelatedCompany.objects.filter(company=company)

        total_news_found = 0
        total_news_saved = 0

        for entity in entities:
            logger.info(f"----> Buscando notícias para competidor: {entity.name}...")

            input_text = f"""
            entity_type: {entity.kind}
            entity_name: {entity.name}
            entity_symbol: {entity.stock_symbol or ''}
            entity_website: {entity.website}
            entity_keywords: {', '.join(entity.sectors or [])}
            """

            response = client.responses.create(
                prompt={'id': os.getenv('OPENAI_PROMPT_ID_MI02')},
                input=input_text,
                store=True,
                include=[
                    "reasoning.encrypted_content",
                    "web_search_call.action.sources"
                ],
                timeout=600
            )

            raw_output = response.output_text
            logger.info(f"[{entity.name}] Search done, raw length={len(raw_output)}")

            extracted_info = safe_load_json(raw_output)
            if not isinstance(extracted_info, list) or not extracted_info:
                logger.warning(f"[{entity.name}] Nenhuma notícia extraída.")
                continue

            news_found = len(extracted_info)
            news_saved = 0
            total_news_found += news_found

            for new in extracted_info:
                try:
                    raw_date = new.get("news_date")
                    date_published = parse_news_date(raw_date)

                    obj, created = MarketNewsArticle.objects.get_or_create(
                        url=new.get("news_link"),
                        company_fk=company,
                        defaults={
                            "company": entity.name,
                            "type": entity.kind,
                            "title": new.get("news_title", ""),
                            "date_published": date_published,
                            "category": new.get("news_category", "").lower(),
                            "relevance": new.get("news_relevance", "").lower(),
                        }
                    )

                    if created:
                        news_saved += 1
                    else:
                        logger.info(f"→ Notícia já existente: {obj.title}")

                except Exception as e:
                    logger.exception(f"Erro ao salvar notícia para {entity.name}: {e}")
                    continue

            total_news_saved += news_saved
            logger.info(f"[{entity.name}] Finalizado — encontradas={news_found}, salvas={news_saved}")

        result.update({
            "success": True,
            "message": "Process completed successfully",
            "news_found": total_news_found,
            "news_saved": total_news_saved,
        })
        return result

    except Exception as e:
        logger.exception(f"Erro ao buscar notícias de competidores: {e}")
        result["message"] = str(e)
        return result
