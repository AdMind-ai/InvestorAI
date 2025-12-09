
import os
import time
from celery import shared_task
from asyncio.log import logger
from django.db import IntegrityError
from openai import BadRequestError
from django.db import transaction
from core.models.ceo_article_model import CEOArticle
from core.utils.tasks.collect_market_news import safe_load_json
from core.views.perplexity.ceo_news_view import get_sentiment_analysis
from core.models.company_info.ceo import CEO
from core.models.openai_ceo_conversaitons_model import CEOConversation
from core.models.company_info.company_info import CompanyInfo
from core.utils.openai_client import client


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
        
        # Try to fetch/create the CEOConversation with minimal locking.
        # We avoid holding a DB lock while calling the external client to create a conversation.
        with transaction.atomic():
            ceo_conversation, created = CEOConversation.objects.select_for_update().get_or_create(
                company=company_instance,
                ceo=ceo_instance,
            )
            existing_conv_id = ceo_conversation.conversation_id

        if existing_conv_id:
            conversation_id = existing_conv_id
        else:
            # Create conversation outside DB transaction to avoid long locks
            logger.info(f"🆕 Creating new conversation for CEO {ceo_name}")
            new_conversation = client.conversations.create()
            conversation_id = new_conversation.id

            # Try to save conversation_id only if another process hasn't already set it
            try:
                with transaction.atomic():
                    obj = CEOConversation.objects.select_for_update().get(pk=ceo_conversation.pk)
                    if not obj.conversation_id:
                        obj.conversation_id = conversation_id
                        obj.save(update_fields=["conversation_id"])
                        logger.info(f"✅ Conversation id saved for CEO {ceo_name}: {conversation_id}")
                    else:
                        # Another process set it first; use that one
                        conversation_id = obj.conversation_id
                        logger.info(f"ℹ️ Conversation id already set by another worker for {ceo_name}: {conversation_id}")
            except CEOConversation.DoesNotExist:
                # Extremely unlikely: if row disappeared, create it
                CEOConversation.objects.create(company=company_instance, ceo=ceo_instance, conversation_id=conversation_id)
                logger.info(f"✅ Conversation record created with id for CEO {ceo_name}: {conversation_id}")
            
        ceoInfos = f"""
                Name: {ceo_name}
                Company: {company_short_name}
                Company website: {company_url}
                """
        
        MAX_RETRIES = 10
        RETRY_DELAY = 12

        response = None
        for attempt in range(MAX_RETRIES):
            try:
                response = client.responses.create(
                    prompt={"id": os.getenv("OPENAI_PROMPT_ID_CEO_NEWS")},
                    input=ceoInfos,
                    conversation=conversation_id,
                    store=True,
                    timeout=900,
                )
                break  # success

            except BadRequestError as e:
                msg = str(e)
                # handle conversation lock with retry
                if "conversation_locked" in msg or "locked" in msg:
                    logger.warning(f"🕒 Conversa bloqueada (tentativa {attempt+1}/{MAX_RETRIES}) para {ceo_name}, esperando {RETRY_DELAY}s...")
                    time.sleep(RETRY_DELAY)
                    continue
                # re-raise other BadRequest errors
                raise

        if response is None:
            raise RuntimeError(f"OpenAI response not obtained for {ceo_name} after {MAX_RETRIES} attempts")

        # Garantir JSON válido
        raw_output = response.output_text
        
        logger.info(f"[Search done, raw length={len(raw_output)})")
        jsonRes = safe_load_json(raw_output)

        # Garante que o formato esteja correto
        results = jsonRes.get("results", [])
        logger.info(f"📰 {len(results)} artigos encontrados para {ceo_name}")

        created_count = 0

        for article in results:
            # Normalize and extract fields defensively; the response schema may vary.
            content = article.get("content") or article.get("text") or ''
            title = article.get("title") or (content[:120] if content else None)
            date_published = article.get("date_published") or article.get("published")

            # Try several possible URL keys that different prompts/APIs may return
            possible_url = None
            for key in ("source", "url", "link", "source_url", "website"):
                v = article.get(key)
                if v:
                    # if v is a dict (sometimes metadata), try to extract 'url'
                    if isinstance(v, dict):
                        possible_url = v.get("url") or v.get("href") or None
                    else:
                        possible_url = v
                    if possible_url:
                        break

            # Normalize URL string
            url_value = None
            if possible_url:
                try:
                    url_value = str(possible_url).strip()
                    if url_value == '' or url_value.lower() in ("null", "none"):
                        url_value = None
                except Exception:
                    url_value = None

            sentiment = get_sentiment_analysis(ceo_name, content)

            # Debug logging to help diagnose duplicated-url issue
            logger.debug(f"Article fields for CEO={ceo_name}: title={title!r}, url={url_value!r}, date={date_published!r}")

            try:
                with transaction.atomic():
                    # 1) If we have a URL, only skip when the same CEO already has that URL.
                    if url_value:
                        exists_same_ceo = CEOArticle.objects.filter(url=url_value, personality=ceo_instance).exists()
                        if exists_same_ceo:
                            logger.info(f"⚠️ URL duplicada para este CEO, ignorando artigo: {url_value} (title='{title}')")
                            continue

                    # 2) Otherwise create or update based on (title, personality).
                    obj, created = CEOArticle.objects.update_or_create(
                        title=title,
                        personality=ceo_instance,
                        defaults={
                            "content": content,
                            "date_published": date_published,
                            "sentiment": sentiment,
                            "url": url_value,
                        },
                    )
                    if created:
                        created_count += 1
            except IntegrityError as e:
                logger.info(
                    f"⚠️ Conflito de unicidade para '{title}' (CEO={ceo_name}): {e}. Ignorando registro."
                )


        logger.info(f"✅ {created_count} novos artigos criados para {ceo_name}")

        return {"ceo": ceo_name, "created": created_count}

    except Exception as e:
        logger.error(f"❌ Erro ao buscar notícias para {ceo_name}: {e}", exc_info=True)
        return {"ceo": ceo_name, "error": str(e)}
