
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
            
        ceoInfos = f"""
                Name: {ceo_name}
                Company: {company_short_name}
                Company website: {company_url}
                """
        
        MAX_RETRIES = 10
        RETRY_DELAY = 12

        for attempt in range(MAX_RETRIES):
            try:
                response = client.responses.create(
                    prompt={"id": os.getenv("OPENAI_PROMPT_ID_CEO_NEWS")},
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

            # Normaliza chaves esperadas
            title = article.get("title")
            content = article.get("content")
            date_published = article.get("date_published")
            url_value = article.get("source")  # 'source' vem como URL na resposta

            try:
                with transaction.atomic():
                    # 1) Se já existe um artigo com a mesma URL para a MESMA personalidade, ignora sem atualizar
                    if url_value and CEOArticle.objects.filter(url=url_value, personality=ceo_instance).exists():
                        logger.info(
                            f"⚠️ URL duplicada para este CEO, ignorando artigo: {url_value} (title='{title}')"
                        )
                        continue

                    # 2) Garante correspondência com a constraint única (title, personality)
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
