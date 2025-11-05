from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from celery.result import AsyncResult
from backend.celery import app

from core.utils.get_company_info import get_user_company
from core.tasks.market_report_monthly_tasks import generate_market_monthly_report
from core.models.market_company_report import CompanyMarketReport
import json


class MarketMonthlyReportTriggerView(APIView):
	"""
	POST → Dispara a task Celery (MI04) para gerar o relatório mensal de mercado
	para a empresa do usuário autenticado (resumos do último mês).
	"""
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAuthenticated]

	def post(self, request):
		user = request.user
		company = get_user_company(user)

		if not company:
			return Response({"error": "No company found for this user."}, status=status.HTTP_404_NOT_FOUND)

		task = generate_market_monthly_report.delay(company.id)
		return Response({
			"message": f"Monthly market report generation started for {company.long_name}",
			"task_id": task.id,
		}, status=status.HTTP_202_ACCEPTED)


class MarketMonthlyReportStatusView(APIView):
	"""
	GET → Retorna o status de execução da task MI04, incluindo o resultado
	quando concluída.
	"""
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAuthenticated]

	def get(self, request, task_id):
		result = AsyncResult(task_id, app=app)
		response_data = {
			"task_id": task_id,
			"status": result.status,
			"result": result.result if result.ready() else None,
		}
		return Response(response_data, status=status.HTTP_200_OK)


class MarketMonthlyReportLatestView(APIView):
	"""
	GET → Retorna o report mensal mais recente (CompanyMarketReport) da company do usuário autenticado.
	Response shape: { report: string, citations: string[] }
	"""
	authentication_classes = [JWTAuthentication]
	permission_classes = [IsAuthenticated]

	def get(self, request):
		user = request.user
		company = get_user_company(user)
		if not company:
			return Response({"error": "No company found for this user."}, status=status.HTTP_404_NOT_FOUND)

		latest = (
			CompanyMarketReport.objects
			.filter(company=company.long_name)
			.order_by('-created_at')
			.first()
		)
		if not latest:
			return Response({"report": "", "citations": []}, status=status.HTTP_200_OK)

		citations_list = []
		if latest.citations:
			try:
				parsed = json.loads(latest.citations)
				if isinstance(parsed, list):
					citations_list = [str(x) for x in parsed if x]
			except Exception:
				citations_list = []

		return Response({
			"report": latest.report or "",
			"citations": citations_list,
		}, status=status.HTTP_200_OK)

