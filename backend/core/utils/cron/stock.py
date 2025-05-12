import requests
from core.utils.yahoo_finance import YahooFinanceService


def get_usd_to_eur_rate():
    response = requests.get('https://open.er-api.com/v6/latest/USD')
    response.raise_for_status()
    data = response.json()
    return data['rates']['EUR']


def get_stock_info(company):
    symbol = company.stock_symbol
    if not symbol:
        return None
    result = YahooFinanceService.get_company_info(symbol)
    if not result["success"]:
        return None
    return result["data"]
