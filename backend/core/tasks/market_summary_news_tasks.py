from celery import shared_task
from core.models.company_info import CompanyInfo
import logging
from openai import OpenAI
from openai import BadRequestError
import os
import time
import random
import json
from core.models.summary_news_model import SummaryNewsArticle
from core.models.market_article_model import MarketNewsSetup
from core.utils.tasks.collect_market_news import safe_load_json

logger = logging.getLogger(__name__)
client = OpenAI(api_key=os.getenv('OPENAI_KEY'))


# ================================================================
# Task para gerar resumo das notícias do setor e competidores (MI03)
# ================================================================
@shared_task(bind=True)
def fetch_market_summary_new(self, company_id, type, news, entity_name):
    """
    Gera resumos (clusters) a partir de uma lista de notícias recém-salvas e persiste
    em SummaryNewsArticle.

    Params
    - company_id: ID da CompanyInfo
    - type: "sector" | "competitor" | "client" | "fornitori"
    - news: list[{
        news_title, news_date, news_link, news_relevance, news_category
      }]

    Output esperado do MI03: lista de objetos com
    - summary_title
    - summary_description
    - summary_relevance (High|Medium|Low)
    - summary_category
    """

    result = {
        "success": False,
        "company": None,
        "type": type,
        "summaries_saved": 0,
        "message": "",
    }

    try:
        company = CompanyInfo.objects.get(id=company_id)
        result["company"] = company.long_name

        if not news:
            result["message"] = "Lista de notícias vazia."
            return result

        # Prepara input para MI03
        try:
            news_json = json.dumps(news, ensure_ascii=False)
        except Exception:
            # Se houver objeto não serializável, tenta normalizar de forma simples
            normalized = []
            for it in news:
                normalized.append({
                    "news_title": (it.get("news_title") if isinstance(it, dict) else str(it)),
                    "news_date": (it.get("news_date") if isinstance(it, dict) else None),
                    "news_link": (it.get("news_link") if isinstance(it, dict) else None),
                    "news_relevance": (it.get("news_relevance") if isinstance(it, dict) else None),
                    "news_category": (it.get("news_category") if isinstance(it, dict) else None),
                })
            news_json = json.dumps(normalized, ensure_ascii=False)

        logger.info(f"[Summary] company={company.long_name} type={type} news_json_length={len(news_json)}")

        # Fetch conversation id for MI03 from setup to keep context across calls
        setup = MarketNewsSetup.objects.filter(company=company).first()
        conversation_id = setup.conversation_id_mi03 if setup else None

        # Call OpenAI with retry/backoff if conversation is locked by another process
        max_attempts = 20
        backoff = 0.8
        attempt = 0
        while True:
            try:
                response = client.responses.create(
                    prompt={'id': os.getenv('OPENAI_PROMPT_ID_MI03')},
                    input=news_json,
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
                        f"[MI03] Conversation locked for company={company.long_name}, type={type}. "
                        f"Retrying in {sleep_s:.2f}s (attempt {attempt+1}/{max_attempts})."
                    )
                    time.sleep(sleep_s)
                    attempt += 1
                    continue
                else:
                    raise

        raw_output = response.output_text
        logger.info(f"[Summary MI03] company={company.long_name} type={type} raw_length={len(raw_output)}")

        summaries = safe_load_json(raw_output)
        if not isinstance(summaries, list) or not summaries:
            result["message"] = "MI03 não retornou lista válida."
            return result

        saved = 0
        for s in summaries:
            try:
                title = (s.get("summary_title") or "").strip()
                description = (s.get("summary_description") or "").strip()
                category = (s.get("summary_category") or "").strip().lower()
                relevance = (s.get("summary_relevance") or "").strip().lower()
                source_links = s.get("summary_links") or ""

                if not title or not description:
                    continue

                SummaryNewsArticle.objects.create(
                    company=company.long_name,
                    company_fk=company,
                    type=type,
                    title=title,
                    description=description,
                    category=category,
                    sources_urls=source_links,
                    relevance=relevance if relevance in {"high", "medium", "low"} else None,
                )
                saved += 1
            except Exception as e:
                logger.exception(f"Erro ao salvar summary: {e}")
                continue

        result.update({
            "success": True,
            "summaries_saved": saved,
            "message": "Process completed successfully" if saved > 0 else "Nenhum resumo salvo.",
        })
        return result

    except Exception as e:
        logger.exception(f"Erro na task de resumo MI03: {e}")
        result["message"] = str(e)
        return result