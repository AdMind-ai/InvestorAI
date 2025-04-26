import requests
from django.conf import settings


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
