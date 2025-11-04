from celery import shared_task
from core.models.company_info import CompanyInfo
import logging
from openai import OpenAI
import os
from core.models.market_article_model import MarketNewsArticle, MarketNewsSetup
from core.utils.tasks.collect_market_news import parse_news_date, safe_load_json

logger = logging.getLogger(__name__)

client = OpenAI(api_key=os.getenv('OPENAI_KEY'))

@shared_task(bind=True)
def fetch_market_sector_news_task(self, company_id=None):
    """
    Task Celery responsável por buscar notícias de mercado relacionadas ao setor de uma empresa.
    - Se 'company_id' for informado → busca apenas para essa empresa.
    - Caso contrário → busca para todas as empresas.
    """
    result_all = []
    
    try:
        if company_id:
            companies = CompanyInfo.objects.filter(id=company_id)
        else:
            companies = CompanyInfo.objects.all()

        total = companies.count()
        logger.info(f"[MarketSectorNews] Iniciando busca para {total} empresa(s).")

        for company in companies:
            # Verifica se a company já tem setup configurado
            setup = MarketNewsSetup.objects.filter(company=company).first()
            if not setup or not setup.is_configured:
                logger.info(f"→ Empresa {company.long_name} não possui setup configurado para busca de notícias.")
                result_all.append({
                    "success": False,
                    "company": company.long_name,
                    "type": "sector",
                    "message": "Setup não configurado.",
                    "news_found": 0,
                    "news_saved": 0,
                })
                continue
            
            logger.info(f"→ Buscando notícias de setor para {company.long_name}...")
            
            # Campos que serão utilizados na busca real
            description = company.description
            sector_keyords = company.sector_keywords
            sector_websites = company.sector_websites

            input = f"""
            company_name: {company.long_name}
            company_description: {description}
            sector_keywords: {', '.join(sector_keyords)}
            sector_websites: {', '.join(sector_websites)}
            """
            
            # Lógica de busca de notícias
            response = client.responses.create(
                prompt={ 'id': os.getenv('OPENAI_PROMPT_ID_MI01') },
                input=input,
                store=True,
                include=[
                    "reasoning.encrypted_content",
                    "web_search_call.action.sources"
                ],
                timeout=600
            )
            
            raw_output = response.output_text
            logger.info(f"[{company.long_name}] Search done, raw length={len(raw_output)}")

            # 🔹 Tenta carregar o JSON
            extracted_info = safe_load_json(raw_output)

            if not isinstance(extracted_info, list) or extracted_info == []:
                logger.error(f"[{company.long_name}] Search failed or returned empty list.")
                result_all.append({
                    "success": False,
                    "company": company.long_name,
                    "type": "sector",
                    "message": "Extraction failed or returned empty list.",
                    "news_found": 0,
                    "news_saved": 0,
                })
                continue
            
            # 🔹 Lógica de contagem e salvamento
            news_found = len(extracted_info)
            news_saved = 0

            for new in extracted_info:
                try:
                    raw_date = new.get("news_date")
                    date_published = parse_news_date(raw_date)

                    obj, created = MarketNewsArticle.objects.get_or_create(
                        url=new.get("news_link"),
                        company_fk=company,
                        defaults={
                            "company": company.long_name,
                            "type": 'sector',
                            "title": new.get("news_title", ""),
                            "date_published": date_published,
                            "category": new.get("news_category", "").lower(),
                            "relevance": new.get("news_relevance", "").lower()
                        }
                    )

                    if created:
                        news_saved += 1
                    else:
                        logger.info(f"→ Notícia já existente: {obj.title}")

                except Exception as e:
                    logger.exception(f"Erro ao salvar notícia para {company.long_name}: {e}")
                    continue

            logger.info(f"[{company.long_name}] Task finished, found={news_found}, saved={news_saved}")

            result_all.append({
                "success": True,
                "company": company.long_name,
                "type": 'sector',
                "message": "Process completed successfully",
                "news_found": news_found,
                "news_saved": news_saved,
            })

        return result_all

    except Exception as e:
        logger.exception(f"Erro na task de busca de notícias de setor: {e}")
        result_all.append({
            "success": False,
            "company": "General",
            "type": "sector",
            "message": str(e),
            "news_found": 0,
            "news_saved": 0,
        })
        return result_all
