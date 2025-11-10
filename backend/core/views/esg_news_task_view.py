from core.utils.get_company_info import get_user_company
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from celery.result import AsyncResult
from backend.celery import app

from core.tasks.esg_news_tasks import (
    fetch_esg_news_dispatcher,
    fetch_esg_news,
    generate_monthly_esg_news_report,
)


class ESGNewsFetchTriggerView(APIView):
    """POST → Dispara task para coletar notícias ESG.

    Se fornecer `company_id` no body JSON, dispara apenas para a empresa.
    Caso contrário dispara dispatcher para todas.
    Retorna `task_id`.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        company = get_user_company(user)
        try:
            if company:
                task = fetch_esg_news.delay(int(company.id))
                msg = f"Fetch ESG news triggered for company {company.short_name}"
            else:
                task = fetch_esg_news_dispatcher.delay()
                msg = "Dispatcher triggered for all companies"
            return Response({"message": msg, "task_id": task.id}, status=status.HTTP_202_ACCEPTED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ESGMonthlyReportTriggerView(APIView):
    """POST → Dispara geração do relatório mensal ESG para uma empresa.

    Body JSON deve conter `company_id`.
    Retorna `task_id`.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        company = get_user_company(user)
        if not company:
            return Response({"error": "company is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            task = generate_monthly_esg_news_report.delay(int(company.id))
            return Response({
                "message": f"Monthly ESG report generation triggered for company {company.short_name}",
                "task_id": task.id
            }, status=status.HTTP_202_ACCEPTED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ESGNewsTaskStatusView(APIView):
    """GET → Status de execução de uma task Celery ESG.

    URL param: /esg-news/task-status/<task_id>/
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, task_id):
        result = AsyncResult(task_id, app=app)
        data = {
            "task_id": task_id,
            "status": result.status,
            "result": result.result if result.ready() else None,
        }
        # incluir traceback se houver
        if hasattr(result, "traceback") and result.traceback:
            data["traceback"] = result.traceback
        return Response(data, status=status.HTTP_200_OK)

