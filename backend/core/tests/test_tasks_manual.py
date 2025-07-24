from core.tasks import *
from datetime import datetime

# python manage.py shell
current_year = datetime.now().year

collect_market_news.delay('sector')
collect_market_news.delay('competitors')
fetch_and_store_competitors.delay()
fetch_and_store_daily_company_stock_data.delay()
generate_monthly_market_report.delay()
generate_company_quarterly_report.delay("Q1", current_year)
generate_company_quarterly_report.delay("Q2", current_year)
generate_company_quarterly_report.delay("Q3", current_year)
generate_company_quarterly_report.delay("Q4", current_year)
daily_ceo_articles_fetch.delay()
fetch_all_esg_topics_daily.delay()
