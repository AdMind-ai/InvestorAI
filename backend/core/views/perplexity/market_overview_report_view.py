import json
import os
import requests
from django.http import StreamingHttpResponse
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser

from core.serializers.perplexity_serializer import PerplexityRequestSerializer

from datetime import datetime, timedelta
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from core.models.market_article_model import MarketNewsArticle
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from rest_framework import serializers
from django.db.models import Q
from core.models.market_company_report import CompanyMarketReport

SYSTEM_MESSAGE = (
    "You are an advanced deep search AI. Your role is to understand and process "
    "complex queries by dissecting the input, identifying key themes, and "
    "retrieving relevant and precise information. Ensure a thorough search "
    "through multiple data layers and provide well-structured, concise, and "
    "contextually appropriate results. Prioritize clarity, accuracy, and "
    "relevance in all of your responses."
)


class MonthlyMarketReportSerializer(serializers.Serializer):
    company = serializers.CharField(max_length=255)


class MonthlyMarketReportView(APIView):
    # authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [FormParser, MultiPartParser, JSONParser]
    serializer_class = MonthlyMarketReportSerializer

    def post(self, request):
        serializer = MonthlyMarketReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        company = serializer.validated_data['company']

        if not company:
            return Response({"error": "Company name is required."}, status=400)

        # Define a faixa de datas (últimos 30 dias)
        today = datetime.today()
        last_month = today - timedelta(days=30)

        # Busca títulos de notícias do último mês para a empresa especificada
        news_titles = MarketNewsArticle.objects.filter(
            Q(company__iexact=company) &
            Q(date_published__gte=last_month)
        ).values_list('title', flat=True)

        if not news_titles:
            return Response({"error": "No news found for this company in the last month."}, status=404)

        titles_text = ' '.join(news_titles)

        # Cria a mensagem para enviar à API Perplexity
        message = (
            f"You need to create a monthly report overview for {company}. "
            f"The report should summarize the key events, trends, ups and downs, and important data from the last month. "
            f"Use the following news titles to guide the content: {titles_text}. "
            "Ensure the summary is concise and covers significant points relevant to the company's performance and market position."
        )

        api_key = os.getenv("PERPLEXITY_KEY")
        if not api_key:
            return Response({"error": "API Key is missing"}, status=500)

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        request_body = {
            "model": "sonar-deep-research",
            "messages": [
                {"role": "system", "content": SYSTEM_MESSAGE},
                {"role": "user", "content": message},
            ],
        }

        # Realiza a requisição à API Perplexity
        try:
            response = requests.post(
                "https://api.perplexity.ai/chat/completions",
                headers=headers,
                json=request_body
            )
            response.raise_for_status()
            data = response.json()

            # Obter o relatório da resposta da API Perplexity
            report_content = data.get("choices", [{}])[0].get(
                "message", {}).get("content", "")

            print("\n\nRelatóriuo Mensal:\n", report_content)

            # Salva o relatório no banco de dados
            if report_content:
                CompanyMarketReport.objects.create(
                    company=company,
                    report=report_content
                )
                return Response(report_content, status=201)

            return Response({"error": "Failed to generate report."}, status=500)

        except requests.RequestException as e:
            return Response({"error": str(e)}, status=500)

    def get(self, request):
        company = request.query_params.get('company')
        recent = request.query_params.get('recent', 'false').lower() == 'true'

        # Calcula a data de um mês atrás
        today = datetime.today()
        last_month = today - timedelta(days=30)

        # Define a query base
        report_query = CompanyMarketReport.objects.all()

        # Filtra por empresa, se fornecido
        if company:
            report_query = report_query.filter(
                company__iexact=company)

        # Aplica filtro de data se "recent" for True
        if recent:
            report_query = report_query.filter(created_at__gte=last_month)

        # Ordena e pega o mais recente se uma empresa específica e "recent" forem fornecidos
        if company and recent:
            report_query = report_query.order_by('-created_at').first()
            # Se não encontrar, retorna erro
            if not report_query:
                return Response({"error": "No report found for this company."}, status=404)
            report_data = {
                "company": report_query.company,
                "created_at": report_query.created_at,
                "report": report_query.report
            }
            return Response(report_data, status=200)

        # Se não formos buscar um específico (não tem recent ou company), retorna todos
        reports = report_query.order_by('-created_at')
        report_list = [{
            "company": report.company,
            "created_at": report.created_at,
            "report": report.report
        } for report in reports]

        return Response(report_list, status=200)
