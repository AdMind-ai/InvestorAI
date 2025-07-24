from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework_simplejwt.authentication import JWTAuthentication
from core.models.company_quarterly_report import CompanyQuarterlyReport
from rest_framework import status
from openai import OpenAI
import os
import requests
from rest_framework import serializers
from core.utils.get_company_info import get_user_company
from django.db.models import Q


class CompanyQuarterlyReportSerializer(serializers.Serializer):
    quarter = serializers.ChoiceField(choices=CompanyQuarterlyReport.QUARTERS)
    year = serializers.IntegerField()


SYSTEM_MESSAGE = (
    "You are an advanced deep search AI. Your role is to understand and process "
    "complex queries by dissecting the input, identifying key themes, and "
    "retrieving relevant and precise information. Ensure a thorough search "
    "through multiple data layers and provide well-structured, concise, and "
    "contextually appropriate results. Prioritize clarity, accuracy, and "
    "relevance in all of your responses."
)


class OpenAICompanyQuarterlyReportView(APIView):
    # authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = CompanyQuarterlyReportSerializer

    def put(self, request, *args, **kwargs):
        serializer = CompanyQuarterlyReportSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        company_info = get_user_company(request.user)
        if not company_info:
            return Response(
                {"error": "No company assigned to user."},
                status=status.HTTP_400_BAD_REQUEST
            )
        company = company_info.short_name

        quarter = serializer.validated_data['quarter']
        year = serializer.validated_data['year']

        missing_params = [param for param in [
            'quarter', 'year'] if not request.data.get(param)]
        if missing_params:
            return Response(
                {"error": f"Missing parameters: {', '.join(missing_params)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        qreport, _ = CompanyQuarterlyReport.objects.get_or_create(
            company=company,
            quarter=quarter,
            year=year
        )

        api_key = os.getenv("PERPLEXITY_KEY")
        if not api_key:
            return Response({"error": "API Key is missing"}, status=500)

        prompt = f"""
        You are a financial analyst creating a detailed ‘Insight Report - Performance Aziendale’ for {company} for {qreport.quarter} of {qreport.year}.

        Your task is to access the press releases, financial statements, and form 10-K (when necessary) to obtain key financial data (Revenue, EBIT, Profit, EPS, guidance, etc.) for that period.
    
        Additionally, use other reliable recent sources from the period if necessary to complement your analysis with announcements, product launches, investments, or strategic news released by {qreport.company} around that quarter.

        Your insight report must be clearly structured in two parts:
        1. Highlights Finanziari
        2. Innovazione e Strategia

        Write clearly, professionally and formatted in Italian. Use real numbers, bullet points, and YoY percentage variations.
        """

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        request_body = {
            "model": "sonar-deep-research",
            "messages": [
                {"role": "system", "content": SYSTEM_MESSAGE},
                {"role": "user", "content": prompt},
            ],
        }

        try:
            resp = requests.post(
                "https://api.perplexity.ai/chat/completions",
                headers=headers,
                json=request_body
            )
            resp.raise_for_status()
            data = resp.json()

            insight_report_text = data.get("choices", [{}])[0].get(
                "message", {}).get("content", "")
            citations = data.get("citations", [])

            if not insight_report_text:
                return Response({"error": "Failed to generate report."}, status=500)

            qreport.insight_report = insight_report_text
            qreport.citations = citations
            qreport.save()

            return Response(
                {
                    "insight_report": insight_report_text,
                    "citations": citations,
                    "message": "Insight Report successfully generated and updated via Perplexity."
                },
                status=status.HTTP_200_OK
            )

        except requests.RequestException as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request, *args, **kwargs):
        company_info = get_user_company(request.user)
        if not company_info:
            return Response(
                {"error": "No company assigned to user."},
                status=status.HTTP_400_BAD_REQUEST
            )
        company = company_info.short_name
        long_name = getattr(company_info, 'long_name', None)

        # Busca os mesmos para ambos nomes
        company_query = Q(company__iexact=company)
        if long_name:
            company_query |= Q(company__iexact=long_name)

        available_reports = CompanyQuarterlyReport.objects.filter(
            company_query,
            insight_report__isnull=False
        ).values('quarter', 'year').distinct().order_by('-year', '-quarter')

        options = [
            f"{row['quarter']} {row['year']}" for row in available_reports]

        quarter = request.query_params.get('quarter')
        year = request.query_params.get('year')
        report_data = None

        if quarter and year:
            qreport = CompanyQuarterlyReport.objects.filter(
                company_query,
                quarter=quarter,
                year=year,
                insight_report__isnull=False
            ).order_by('-created_at').first()
            if qreport:
                report_data = {
                    "insight_report": qreport.insight_report,
                    "citations": qreport.citations,
                    "message": "Insight Report successfully retrieved."
                }
            else:
                report_data = {
                    "error": "Quarterly report not found.", "status": 404}

        return Response({
            "available_options": options,
            **({"report": report_data} if report_data else {})
        }, status=status.HTTP_200_OK)
