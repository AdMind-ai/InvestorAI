import requests
from django.conf import settings
import datetime


def alpha_to_yfinance_format(alpha_data):
    meta = alpha_data.get("Meta Data", {})
    time_series = alpha_data.get("Time Series (Daily)", {})
    symbol = meta.get("2. Symbol", None)
    timezone = meta.get("5. Time Zone", "US/Eastern")
    dates = sorted(time_series.keys(), reverse=True)
    currency = "USD"  # Alpha só lida com EUA no free, então pode fixar

    # regularMarketTime: '2025-05-06' (YYYY-MM-DD) em Last Refreshed => timestamp Unix
    last_refreshed = meta.get("3. Last Refreshed")
    if last_refreshed:
        dt = datetime.datetime.strptime(last_refreshed, "%Y-%m-%d")
        # Fechamento padrão NYSE/NASDAQ é 16:00 NYT (horário de verão geralmente em maio)
        market_close_time = dt.replace(hour=16, minute=0)
        # Simula gmtoffset de Nova York, -4 horas no verão (EDT)
        market_close_time = market_close_time.replace(
            tzinfo=datetime.timezone(datetime.timedelta(hours=-4)))
        regular_market_time = int(market_close_time.timestamp())
    else:
        regular_market_time = None

    # previousClose: último fechamento válido
    if len(dates) > 0:
        previous_close = float(time_series[dates[0]]["4. close"])
    else:
        previous_close = None

    # regularMarketPrice: último fechamento
    if dates:
        regular_market_price = float(time_series[dates[0]]["4. close"])
        regular_market_day_high = float(time_series[dates[0]]["2. high"])
        regular_market_day_low = float(time_series[dates[0]]["3. low"])
        regular_market_volume = int(time_series[dates[0]]["5. volume"])
    else:
        regular_market_price = regular_market_day_high = regular_market_day_low = regular_market_volume = None

    # Monta info (preencha só o essencial)
    info = {
        "currency": currency,
        "symbol": symbol,
        "exchangeName": None,
        "fullExchangeName": None,
        "instrumentType": None,
        "firstTradeDate": None,
        "regularMarketTime": regular_market_time,
        "hasPrePostMarketData": None,
        "gmtoffset": -14400 if timezone.lower().startswith("us/") else None,  # EDT offset segundos
        "timezone": "EDT" if timezone.lower().startswith("us/") else timezone,
        "exchangeTimezoneName": "America/New_York" if timezone.lower().startswith("us/") else timezone,
        "regularMarketPrice": regular_market_price,
        "fiftyTwoWeekHigh": None,
        "fiftyTwoWeekLow": None,
        "regularMarketDayHigh": regular_market_day_high,
        "regularMarketDayLow": regular_market_day_low,
        "regularMarketVolume": regular_market_volume,
        "longName": None,
        "shortName": None,
        "chartPreviousClose": previous_close,
        "previousClose": previous_close,
        "scale": None,
        "priceHint": None,
        "currentTradingPeriod": None,
        "tradingPeriods": {"pre_start": [], "pre_end": [], "start": [], "end": [], "post_start": [], "post_end": []},
        "dataGranularity": "1d",
        "range": None,
        "validRanges": [],
        "lastTrade": {"Price": regular_market_price, "Time": f"{dates[0]}T16:00:00-04:00"} if dates else None,
    }

    # Monta data (historyData)
    data = []
    for date in sorted(dates):
        ohlc = time_series[date]
        data.append({
            "Date": f"{date}T16:00:00-04:00",  # Formato ISO, USA market close
            "Open": float(ohlc["1. open"]),
            "High": float(ohlc["2. high"]),
            "Low": float(ohlc["3. low"]),
            "Close": float(ohlc["4. close"]),
            "Volume": int(ohlc["5. volume"]),
            "Dividends": 0,      # Alpha não oferece dividendos aqui
            "Stock Splits": 0,   # Idem
        })

    # Construção final
    return {"info": info, "data": data}


class AlphaVantageService:
    BASE_URL = "https://www.alphavantage.co/query"

    @staticmethod
    def get_daily_adjusted(symbol, outputsize="compact"):
        """
        Obtém dados diários ajustados para uma ação

        Args:
            symbol: Símbolo da ação
            outputsize: 'compact' (últimos 100 pontos de dados) ou 'full' (dados completos)

        Returns:
            Dicionário com dados históricos
        """
        params = {
            "function": "TIME_SERIES_DAILY",
            "symbol": symbol,
            "outputsize": outputsize,
            "apikey": settings.ALPHA_VANTAGE_API_KEY
        }

        try:
            response = requests.get(
                AlphaVantageService.BASE_URL, params=params)
            data = response.json()

            if "Error Message" in data:
                return {
                    "success": False,
                    "error": data["Error Message"]
                }

            formated_data = alpha_to_yfinance_format(data)

            return {
                "success": True,
                **formated_data
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    @staticmethod
    def get_company_overview(symbol):
        """
        Obtém visão geral da empresa

        Args:
            symbol: Símbolo da ação

        Returns:
            Dicionário com informações da empresa
        """
        params = {
            "function": "OVERVIEW",
            "symbol": symbol,
            "apikey": settings.ALPHA_VANTAGE_API_KEY
        }

        try:
            response = requests.get(
                AlphaVantageService.BASE_URL, params=params)
            data = response.json()

            if "Error Message" in data:
                return {
                    "success": False,
                    "error": data["Error Message"]
                }

            return {
                "success": True,
                "data": data
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    @staticmethod
    def get_company_symbol(keywords):
        """
        Obtém stock symbol da empresa

        Args:
            keywords: A text string of your choice

        Returns:
            Returns the best-matching symbols and market information based on keywords
        """
        params = {
            "function": "SYMBOL_SEARCH",
            "keywords": keywords,
            "apikey": settings.ALPHA_VANTAGE_API_KEY
        }

        try:
            response = requests.get(
                AlphaVantageService.BASE_URL, params=params)
            data = response.json()

            if "Error Message" in data:
                return {
                    "success": False,
                    "error": data["Error Message"]
                }

            return {
                "success": True,
                "data": data
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
