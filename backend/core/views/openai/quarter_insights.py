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
from rest_framework import serializers


client = OpenAI(api_key=os.getenv('OPENAI_KEY'))


class CompanyQuarterlyReportSerializer(serializers.Serializer):
    company = serializers.CharField(max_length=50)
    quarter = serializers.ChoiceField(choices=CompanyQuarterlyReport.QUARTERS)
    year = serializers.IntegerField()


class OpenAICompanyQuarterlyReportView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = CompanyQuarterlyReportSerializer

    def put(self, request, *args, **kwargs):
        serializer = CompanyQuarterlyReportSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        company = serializer.validated_data['company']
        quarter = serializer.validated_data['quarter']
        year = serializer.validated_data['year']

        # validação simples e clara dos inputs
        missing_params = [param for param in ['company',
                                              'quarter', 'year'] if not request.data.get(param)]
        if missing_params:
            return Response(
                {"error": f"Missing parameters: {', '.join(missing_params)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            qreport = CompanyQuarterlyReport.objects.get(
                company=company,
                quarter=quarter,
                year=year
            )
        except CompanyQuarterlyReport.DoesNotExist:
            return Response({"error": "Quarterly report not found."}, status=status.HTTP_404_NOT_FOUND)

        prompt = f"""
        You are a financial analyst creating a detailed ‘Insight Report - Performance Aziendale’ for {qreport.company} for {qreport.quarter}, {qreport.year}. 
        
        Your task is to access the provided press release, financial statements, and form 10-K (when available) to obtain key financial data (Revenue, EBIT, Profit, EPS, guidance, etc.) for that period.

        URLs provided are:
        - Press Release: {qreport.press_release}
        - Financial Statements: {qreport.financial_statements}
        {f'- Form 10-K: {qreport.form_10k}' if qreport.form_10k else ''}
        
        Additionally, use other reliable recent sources from the period if necessary to complement your analysis with announcements, products launches, investments, or strategic news released by {qreport.company} around that quarter.

        Your insight report must be clearly structured in two parts:
        1. Highlights Finanziari
        2. Innovazione e Strategia

        Write clearly, professionally and formatted in Italian. Use realistic numbers, bullet points, and YoY percentage variations. 
        """

        try:
            completion = client.chat.completions.create(
                model="gpt-4o-search-preview",
                messages=[
                    {"role": "system", "content": "You're a financial analyst."},
                    {"role": "user", "content": prompt},
                ],
            )

            insight_report_text = completion.choices[0].message.content

            qreport.insight_report = insight_report_text
            qreport.save()

            return Response(
                {
                    "insight_report": insight_report_text,
                    "message": "Insight Report successfully generated and updated."
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request, *args, **kwargs):
        serializer = CompanyQuarterlyReportSerializer(
            data=request.query_params)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        company = serializer.validated_data['company']
        quarter = serializer.validated_data['quarter']
        year = serializer.validated_data['year']

        try:
            qreport = CompanyQuarterlyReport.objects.get(
                company=company,
                quarter=quarter,
                year=year
            )
        except CompanyQuarterlyReport.DoesNotExist:
            return Response({"error": "Quarterly report not found."}, status=status.HTTP_404_NOT_FOUND)

        if not qreport.insight_report:
            return Response({"error": "Insight report not generated yet."}, status=status.HTTP_404_NOT_FOUND)

        return Response(
            {
                "insight_report": qreport.insight_report,
                "message": "Insight Report successfully retrieved."
            },
            status=status.HTTP_200_OK
        )
