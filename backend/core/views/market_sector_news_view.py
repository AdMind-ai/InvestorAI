from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from core.utils.get_company_info import get_user_company
from core.tasks.market_sector_news_tasks import fetch_market_sector_news_task
from celery.result import AsyncResult
from backend.celery import app

class MarketSectorNewsTriggerView(APIView):
    """
    POST → Dispara a task Celery para buscar notícias de setor da empresa do usuário autenticado.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        company = get_user_company(user)

        if not company:
            return Response({'error': 'No company found for this user.'}, status=status.HTTP_404_NOT_FOUND)

        task = fetch_market_sector_news_task.delay(company.id)
        return Response({
            'message': f'Busca de notícias de setor iniciada para {company.long_name}',
            'task_id': task.id
        }, status=status.HTTP_202_ACCEPTED)


class MarketSectorNewsAllTriggerView(APIView):
    """
    POST → Dispara a task Celery para buscar notícias de setor para todas as empresas.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        task = fetch_market_sector_news_task.delay()
        return Response({
            'message': 'Busca de notícias de setor iniciada para todas as empresas',
            'task_id': task.id
        }, status=status.HTTP_202_ACCEPTED)


class MarketSectorNewsStatusView(APIView):
    """
    GET → Retorna o status de execução de uma task Celery de busca de notícias de setor.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, task_id):
        result = AsyncResult(task_id, app=app)
        response_data = {
            "task_id": task_id,
            "status": result.status,
            "result": result.result if result.ready() else None
        }
        return Response(response_data, status=status.HTTP_200_OK)
