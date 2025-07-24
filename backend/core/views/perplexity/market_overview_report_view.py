import json
import os
import requests
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from rest_framework import status

from core.serializers.perplexity_serializer import PerplexityRequestSerializer

from datetime import datetime, timedelta
from core.models.market_article_model import MarketNewsArticle
from django.db.models import Q
from core.models.market_company_report import CompanyMarketReport
from core.utils.get_company_info import get_user_company
from core.utils.marketNews.create_pdf import create_pdf_with_header_footer
from core.utils.quickdoc import upload_to_blob_storage


SYSTEM_MESSAGE = (
    "You are an advanced deep search AI. Your role is to understand and process "
    "complex queries by dissecting the input, identifying key themes, and "
    "retrieving relevant and precise information. Ensure a thorough search "
    "through multiple data layers and provide well-structured, concise, and "
    "contextually appropriate results. Prioritize clarity, accuracy, and "
    "relevance in all of your responses."
)


def safe_eval_list_string(list_string):
    try:
        citations_list = eval(list_string)
        if isinstance(citations_list, list):
            return citations_list
    except Exception as e:
        print(f"Error evaluating list string: {e}")
    return []


class MonthlyMarketReportView(APIView):
    # authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [FormParser, MultiPartParser, JSONParser]

    def post(self, request):
        company_info = get_user_company(request.user)
        if not company_info:
            return Response(
                {"error": "No company assigned to user."},
                status=status.HTTP_400_BAD_REQUEST
            )
        company = company_info.short_name

        if not company:
            return Response({"error": "Company name is required."}, status=400)

        today = datetime.today()
        last_month = today - timedelta(days=30)

        first_this_month = today.replace(day=1)
        last_month_end = first_this_month - timedelta(days=1)
        first_last_month = last_month_end.replace(day=1)
        month_name = last_month_end.strftime("%B")
        year = last_month_end.strftime("%Y")

        news_titles = MarketNewsArticle.objects.filter(
            Q(company__iexact=company) &
            Q(date_published__gte=first_last_month) &
            Q(date_published__lte=last_month_end)
        ).values_list('title', flat=True)

        # if not news_titles:
        #     return Response({"error": "No news found for this company in the last month."}, status=404)

        # titles_text = ' '.join(news_titles)

        message = (
            f"You need to create a monthly report overview for {company_info.long_name}. "
            f"specifically for the month of {month_name} {year}. "
            f"The report should summarize the key events, trends, ups and downs, and important data from the last month. "
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

        try:
            response = requests.post(
                "https://api.perplexity.ai/chat/completions",
                headers=headers,
                json=request_body
            )
            response.raise_for_status()
            data = response.json()
            print(data)

            report_content = data.get("choices", [{}])[0].get(
                "message", {}).get("content", "")
            citations = data.get("citations", [])

            if report_content:
                CompanyMarketReport.objects.create(
                    company=company,
                    report=report_content,
                    citations=citations
                )
                return Response({"report": report_content, "citations": citations}, status=201)

            return Response({"error": "Failed to generate report."}, status=500)

        except requests.RequestException as e:
            return Response({"error": str(e)}, status=500)

    def get(self, request):
        company_info = get_user_company(request.user)
        if not company_info:
            return Response(
                {"error": "No company assigned to user."},
                status=status.HTTP_400_BAD_REQUEST
            )
        company = company_info.short_name
        long_name = getattr(company_info, "long_name", None)

        recent = request.query_params.get('recent', 'false').lower() == 'true'

        today = datetime.today()
        last_month = today - timedelta(days=30)

        report_query = CompanyMarketReport.objects.all()

        if company or long_name:
            report_query = report_query.filter(
                Q(company__iexact=company) | Q(company__iexact=long_name)
            )

        if recent:
            report_query = report_query.filter(created_at__gte=last_month)

        if company and recent:
            report_query = report_query.order_by('-created_at').first()
            if not report_query:
                return Response({"error": "No report found for this company."}, status=404)

            print(type(report_query.citations), report_query.citations)
            citations_list = safe_eval_list_string(report_query.citations)

            print(type(citations_list), citations_list)
            report_data = {
                "company": report_query.company,
                "created_at": report_query.created_at,
                "report": report_query.report,
                "citations": citations_list,
            }
            return Response(report_data, status=200)

        reports = report_query.order_by('-created_at')
        report_list = []
        for report in reports:
            citations_list = safe_eval_list_string(
                report.citations)
            report_list.append({
                "company": report.company,
                "created_at": report.created_at,
                "report": report.report,
                "citations": citations_list,
            })

        return Response(report_list, status=200)


class GeneratePDFMonthlyMarketReportView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [FormParser, MultiPartParser, JSONParser]

    def post(self, request):
        report = request.data.get('report')

        if not report:
            return Response(
                {"error": "The report field cannot be empty."},
                status=status.HTTP_400_BAD_REQUEST
            )

        company = get_user_company(request.user)
        month_year = datetime.now().strftime("%B_%Y")
        short_name = company.short_name.replace(" ", "_")

        file_name = f"reports/{short_name}_performance_report_{month_year}.pdf"

        pdf = create_pdf_with_header_footer(report, '', company.website)
        url_pdf = upload_to_blob_storage(pdf, file_name)

        return Response({"url": url_pdf})
