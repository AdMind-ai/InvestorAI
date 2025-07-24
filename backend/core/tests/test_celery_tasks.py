from core.tasks import (
    collect_market_news,
    fetch_and_store_competitors,
    fetch_and_store_daily_company_stock_data,
    generate_monthly_market_report,
    generate_company_quarterly_report,
    daily_ceo_articles_fetch,
    fetch_all_esg_topics_daily,
)
import os
import django
from datetime import datetime
from celery.result import AsyncResult

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()


results = []
current_year = datetime.now().year

# Lista de tarefas (nome, chamada do delay)
tasks_to_test = [
    ('collect_market_news (sector)', lambda: collect_market_news.delay('sector')),
    ('collect_market_news (competitors)',
     lambda: collect_market_news.delay('competitors')),
    ('fetch_and_store_competitors', lambda: fetch_and_store_competitors.delay()),
    ('fetch_and_store_daily_company_stock_data',
     lambda: fetch_and_store_daily_company_stock_data.delay()),
    ('generate_monthly_market_report',
     lambda: generate_monthly_market_report.delay()),
    ('generate_company_quarterly_report Q1',
     lambda: generate_company_quarterly_report.delay('Q1', current_year)),
    ('generate_company_quarterly_report Q2',
     lambda: generate_company_quarterly_report.delay('Q2', current_year)),
    ('generate_company_quarterly_report Q3',
     lambda: generate_company_quarterly_report.delay('Q3', current_year)),
    ('generate_company_quarterly_report Q4',
     lambda: generate_company_quarterly_report.delay('Q4', current_year)),
    ('daily_ceo_articles_fetch', lambda: daily_ceo_articles_fetch.delay()),
    ('fetch_all_esg_topics_daily', lambda: fetch_all_esg_topics_daily.delay()),
]

timeout = 30  # segundos para esperar cada task terminar

print('---- INICIANDO OS TESTES DAS CELERY TASKS ----\n')
for name, task_fn in tasks_to_test:
    print(f'Testando: {name} ...', end=' ')
    try:
        job = task_fn()
        res = job.get(timeout=timeout, propagate=False)
        if job.successful():
            print('[OK]')
            results.append((name, 'SUCESSO', str(res)))
        else:
            print('[FALHOU]')
            results.append((name, 'FALHA', str(job.result)))
    except Exception as e:
        print('[ERRO]')
        results.append((name, 'EXCEPTION', str(e)))

print('\n--- RELATÓRIO FINAL ---\n')
for name, status, detail in results:
    print(f'{name:45}  ==>  {status}')
    print(f'    Detalhe: {detail}\n')
