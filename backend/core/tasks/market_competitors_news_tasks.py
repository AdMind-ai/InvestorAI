from celery import shared_task
from core.models.company_info import CompanyInfo
import logging
from openai import OpenAI
from openai import BadRequestError
import os
import time
import random
from core.models.market_article_model import MarketNewsArticle, MarketNewsSetup
from core.models.company_info.competitor import RelatedCompany
from core.utils.tasks.collect_market_news import parse_news_date, safe_load_json
from core.tasks.market_summary_news_tasks import fetch_market_summary_new

logger = logging.getLogger(__name__)
client = OpenAI(api_key=os.getenv('OPENAI_KEY'))


# ================================================================
# Task orquestradora — decide quais empresas processar
# ================================================================
@shared_task(bind=True)
def fetch_market_competitors_dispatcher(self, company_id=None):
    """
    Orquestra a criação de subtasks Celery para buscar notícias de competidores.
    - Se 'company_id' for informado → dispara uma task por competidor dessa empresa.
    - Caso contrário → percorre todas as empresas e dispara uma task por competidor.
    """
    try:
        if company_id:
            companies = CompanyInfo.objects.filter(id=company_id)
        else:
            companies = CompanyInfo.objects.all()

        total_companies = companies.count()
        logger.info(f"[MarketCompetitorsNews] Iniciando dispatcher para {total_companies} empresa(s).")

        dispatched = []
        competitors_total = 0
        for company in companies:
            competitors = RelatedCompany.objects.filter(company=company)
            count = competitors.count()
            competitors_total += count
            if count == 0:
                logger.info(f"[MarketCompetitorsNews] {company.long_name} sem competidores cadastrados.")
                continue
            
            timeout_s = 900
            for competitor in competitors:
                res = fetch_market_competitor_news_task.delay(company.id, competitor.id)
                dispatched.append({
                    "company": company.long_name,
                    "competitor": competitor.name,
                    "competitor_id": competitor.id,
                })
                try:
                    # aguarda conclusão para garantir execução sequencial
                    _ = res.get(timeout=timeout_s, propagate=False)
                except Exception as e:
                    # se não for possível aguardar (ex.: sem backend), loga e dá um pequeno intervalo
                    logger.warning(
                        f"[MarketCompetitorsNews] Falha ao aguardar task do competidor {competitor.name}: {e}. "
                        "Prosseguindo para o próximo após pequena pausa."
                    )
                    time.sleep(30)

        logger.info(
            f"[MarketCompetitorsNews] {len(dispatched)} subtasks (por competidor) criadas com sucesso para {total_companies} empresa(s)."
        )
        return {
            "success": True,
            "companies_count": total_companies,
            "competitors_dispatched_count": len(dispatched),
            "dispatched": dispatched,
        }

    except Exception as e:
        logger.exception(f"Erro ao despachar tasks de competidores: {e}")
        return {
            "success": False,
            "error": str(e)
        }


# ================================================================
# Task individual — busca e salva notícias de UM competidor
# ================================================================
@shared_task(bind=True)
def fetch_market_competitor_news_task(self, company_id, competitor_id):
    """
    Busca e salva notícias de mercado relacionadas a UM competidor específico de uma empresa.
    """
    result = {
        "success": False,
        "company": None,
        "competitor": None,
        "type": "competitor",
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

        entity = RelatedCompany.objects.get(id=competitor_id, company=company)
        result["competitor"] = entity.name

        logger.info(f"→ Buscando notícias para competidor {entity.name} de {company.long_name}...")

        input_text = f"""
        entity_type: {entity.kind}
        entity_name: {entity.name}
        entity_symbol: {entity.stock_symbol or ''}
        entity_website: {entity.website}
        entity_keywords: {', '.join(entity.sectors or [])}
        """
        
        # Pegar conversation_id da setup para MI02
        conversation_id = setup.conversation_id_mi02
        
        # Call OpenAI with retry/backoff if conversation is locked by another process
        max_attempts = 20
        backoff = 0.8
        attempt = 0
        while True:
            try:
                response = client.responses.create(
                    prompt={'id': os.getenv('OPENAI_PROMPT_ID_MI02')},
                    input=input_text,
                    conversation=conversation_id,
                    store=True,
                    include=[
                        "reasoning.encrypted_content",
                        "web_search_call.action.sources"
                    ],
                    timeout=600
                )
                break
            except BadRequestError as e:
                # conversation_locked is returned when two requests hit the same conversation concurrently
                if "conversation_locked" in str(e) and attempt < max_attempts - 1:
                    sleep_s = backoff * (2 ** attempt) + random.uniform(0, 0.5)
                    logger.warning(
                        f"[MI02] Conversation locked for company={company.long_name}, competitor={entity.name}. "
                        f"Retrying in {sleep_s:.2f}s (attempt {attempt+1}/{max_attempts})."
                    )
                    time.sleep(sleep_s)
                    attempt += 1
                    continue
                else:
                    raise

        raw_output = response.output_text
        logger.info(f"[{entity.name}] Search done, raw length={len(raw_output)}")

        extracted_info = safe_load_json(raw_output)
        if not isinstance(extracted_info, list) or not extracted_info:
            logger.warning(f"[{entity.name}] Nenhuma notícia extraída.")
            result["message"] = "Nenhuma notícia encontrada"
            return result

        news_found = len(extracted_info)
        news_saved = 0
        session_news_items = []

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
                    session_news_items.append({
                        "news_title": new.get("news_title", ""),
                        "news_date": raw_date,
                        "news_link": new.get("news_link"),
                        "news_relevance": new.get("news_relevance", ""),
                        "news_category": new.get("news_category", ""),
                    })
                else:
                    logger.info(f"→ Notícia já existente: {obj.title}")

            except Exception as e:
                logger.exception(f"Erro ao salvar notícia para {entity.name}: {e}")
                continue

        # Atualiza result
        result.update({
            "success": True,
            "message": "Process completed successfully",
            "news_found": news_found,
            "news_saved": news_saved,
        })

        # Dispara task de resumo (MI03) com as notícias salvas nesta execução para este competidor
        try:
            if session_news_items:
                # Aguarda o término do resumo para garantir que SUCCESS do competidor
                # represente também a conclusão do MI03.
                timeout_s = 900  # até 15 minutos
                summary_res = fetch_market_summary_new.delay(company.id, entity.kind, session_news_items)
                logger.info(
                    f"[{company.long_name}] Summary task dispatched with {len(session_news_items)} item(s) for competitor {entity.name}."
                )
                try:
                    _ = summary_res.get(timeout=timeout_s, propagate=False)
                except Exception as e:
                    logger.warning(
                        f"[{company.long_name}] Falha ao aguardar summary para {entity.name}: {e}. Prosseguindo."
                    )
            else:
                logger.info(f"[{company.long_name}] Nada novo salvo para {entity.name}; resumo não disparado.")
        except Exception as e:
            logger.exception(f"Erro ao despachar summary task para competidor {entity.name}: {e}")

        return result

    except RelatedCompany.DoesNotExist:
        msg = "Competidor não encontrado para a empresa informada."
        logger.warning(msg)
        result["message"] = msg
        return result
    except Exception as e:
        logger.exception(f"Erro ao buscar notícias do competidor: {e}")
        result["message"] = str(e)
        return result

