from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework_simplejwt.authentication import JWTAuthentication
from core.utils.yahoo_finance import YahooFinanceService
from core.utils.alpha_vantage import AlphaVantageService
import logging

logger = logging.getLogger(__name__)


def convert_mi_to_bit(symbol):
    if symbol.endswith('.MI'):
        return symbol[:-3] + '.BIT'
    return symbol


class StockDataInputSerializer(serializers.Serializer):
    symbol = serializers.CharField(required=True)
    period = serializers.CharField(
        required=False, default='1mo',
        help_text="Ex: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max"
    )
    interval = serializers.CharField(
        required=False, default='1d',
        help_text="Ex: 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo"
    )


class CompanyInfoInputSerializer(serializers.Serializer):
    symbol = serializers.CharField(required=True)


class SearchStocksInputSerializer(serializers.Serializer):
    q = serializers.CharField(required=True)


class StockDataView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = StockDataInputSerializer

    def get(self, request):
        # period: Período de dados (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
        # interval: Intervalo de dados (1m, 2m, 5m, 15m, 30m, 60m, 1d, 1wk, 1mo)
        serializer = StockDataInputSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        symbol = serializer.validated_data['symbol']
        period = serializer.validated_data.get('period', 'max')
        interval = serializer.validated_data.get('interval', '1d')

        if not symbol:
            return Response(
                {"error": "Symbol parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Tenta obter dados do Yahoo Finance primeiro
        result = YahooFinanceService.get_stock_data(symbol, period, interval)

        # Se falhar, tenta Alpha Vantage como fallback
        if not result["success"]:
            logger.warning(
                f"Yahoo Finance API failed for {symbol}. Trying Alpha Vantage.")

            # Ações diárias
            alpha_symbol = convert_mi_to_bit(symbol)
            outputsize = "compact" if period in ["1mo", "3mo"] else "full"
            result = AlphaVantageService.get_daily_adjusted(
                alpha_symbol, outputsize)

        if not result["success"]:
            return Response(
                {"error": f"Failed to fetch data for {symbol}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response({
            "info": result.get("info", {}),
            "data": result.get("data", [])
        })


class CompanyInfoView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = CompanyInfoInputSerializer

    def get(self, request):
        serializer = CompanyInfoInputSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        symbol = serializer.validated_data['symbol']

        if not symbol:
            return Response(
                {"error": "Symbol parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Tenta obter dados do Yahoo Finance primeiro
        result = YahooFinanceService.get_company_info(symbol)

        # Se falhar, tenta Alpha Vantage como fallback
        if not result["success"]:
            logger.warning(
                f"Yahoo Finance API failed for {symbol}. Trying Alpha Vantage.")
            alpha_symbol = convert_mi_to_bit(symbol)
            result = AlphaVantageService.get_company_overview(alpha_symbol)

        if not result["success"]:
            return Response(
                {"error": f"Failed to fetch company info for {symbol}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(result["data"])


class SearchStocksView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = SearchStocksInputSerializer

    def get(self, request):
        serializer = SearchStocksInputSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        query = serializer.validated_data.get('q', '')

        if not query:
            return Response(
                {"error": "Query parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = YahooFinanceService.search_stocks(query)

        # result = AlphaVantageService.get_company_symbol(query)

        if not result["success"]:
            return Response(
                {"error": "Failed to search stocks"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(result["data"])


class FastInfoView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = CompanyInfoInputSerializer

    def get(self, request):
        serializer = CompanyInfoInputSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        symbol = serializer.validated_data['symbol']

        if not symbol:
            return Response(
                {"error": "Symbol parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = YahooFinanceService.get_company_fast_info(symbol)

        if not result["success"]:
            return Response(
                {"error": f"Failed to fetch fast info for {symbol}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(result["data"])


class AnalystPriceTargetsView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = CompanyInfoInputSerializer

    def get(self, request):
        serializer = CompanyInfoInputSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        symbol = serializer.validated_data['symbol']

        if not symbol:
            return Response(
                {"error": "Symbol parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = YahooFinanceService.get_analyst_price_targets(symbol)

        if not result["success"]:
            return Response(
                {"error": f"Failed to fetch analyst price targets for {symbol}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(result["data"])


class RecommendationsView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = CompanyInfoInputSerializer

    def get(self, request):
        serializer = CompanyInfoInputSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        symbol = serializer.validated_data['symbol']

        if not symbol:
            return Response(
                {"error": "Symbol parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        result = YahooFinanceService.get_recommendations(symbol)

        if not result["success"]:
            return Response(
                {"error": f"Failed to fetch recommendations for {symbol}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(result["data"])
