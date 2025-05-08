import yfinance as yf
from datetime import datetime, timedelta
import time
import random
import requests
import os
import shutil


class YahooFinanceService:
    @staticmethod
    def get_stock_data(symbol, period, interval):
        """
        Obtém dados históricos de uma ação

        Args:
            symbol: Símbolo da ação (ex: AAPL, PETR4.SA)
            period: Período de dados (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
            interval: Intervalo de dados (1m, 2m, 5m, 15m, 30m, 60m, 1d, 1wk, 1mo)

        Returns:
            DataFrame com dados históricos
        """
        try:
            stock = yf.Ticker(symbol)
            hist = stock.history(period=period, interval=interval)
            meta = stock.history_metadata
            return {
                "success": True,
                "data": hist.reset_index().to_dict('records'),
                "info": meta
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    @staticmethod
    def get_company_info(symbol):
        """
        Obtém informações detalhadas sobre uma empresa

        Args:
            symbol: Símbolo da ação

        Returns:
            Dicionário com informações da empresa
        """
        try:
            stock = yf.Ticker(symbol)
            return {
                "success": True,
                "data": stock.info
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    @staticmethod
    def get_company_fast_info(symbol):
        """
        Obtém informações detalhadas sobre uma empresa

        Args:
            symbol: Símbolo da ação

        Returns:
            Dicionário com informações da empresa
        """
        try:
            stock = yf.Ticker(symbol)
            return {
                "success": True,
                "data": stock.fast_info
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    @staticmethod
    def get_analyst_price_targets(symbol):
        """
        Obtém os price targets dos analistas para a ação

        Args:
            symbol: Símbolo da ação

        Returns:
            Dicionário com preços-alvo dos analistas
        """
        try:
            stock = yf.Ticker(symbol)
            targets = stock.analysis
            # Em alguns casos, o yfinance retorna price target em stock.info:
            price_targets = {}
            info = stock.info
            # Os campos podem variar. Cheque se existem no info:
            for k in ['targetLowPrice', 'targetMedianPrice', 'targetMeanPrice', 'targetHighPrice', 'currentPrice']:
                price_targets[k] = info.get(k)
            return {
                "success": True,
                "data": price_targets
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    @staticmethod
    def get_recommendations(symbol):
        """
        Obtém recomendações dos analistas para a ação

        Args:
            symbol: Símbolo da ação

        Returns:
            DataFrame com recomendações (pode ser convertido para lista de dicionários)
        """
        try:
            stock = yf.Ticker(symbol)
            rec = stock.recommendations
            if rec is not None:
                rec = rec.reset_index().tail(20)
                data = rec.to_dict('records')
            else:
                data = []
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
    def search_stocks(query):
        """
        Pesquisa ações por nome ou símbolo

        Args:
            query: Termo de pesquisa

        Returns:
            Lista de ações correspondentes
        """
        # Implementação simplificada - em produção, usar uma API de pesquisa mais robusta
        # ou um banco de dados local com símbolos comuns
        common_stocks = {
            "apple": "AAPL",
            "microsoft": "MSFT",
            "amazon": "AMZN",
            "google": "GOOGL",
            "petrobras": "PETR4.SA",
            "vale": "VALE3.SA",
            "itau": "ITUB4.SA",
            "bradesco": "BBDC4.SA",
            "b3": "B3SA3.SA",
            "greenoleo": "GRN.MI",
        }

        results = []
        query = query.lower()

        for name, symbol in common_stocks.items():
            if query in name or query in symbol.lower():
                results.append({"name": name.title(), "symbol": symbol})

        return {
            "success": True,
            "data": results
        }
