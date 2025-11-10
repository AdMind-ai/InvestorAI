from core.tasks.ceos_news_tasks import collect_ceo_news_task
from openai import OpenAI
import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status
from celery.result import AsyncResult

import logging
logger = logging.getLogger(__name__)

client = OpenAI(api_key=os.getenv('OPENAI_KEY'))


class WeeklyCEONewsTaskView(APIView):
    """
    API para disparar manualmente a task semanal (todas as empresas/CEOs)
    """
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            task = collect_ceo_news_task.delay()
            logger.info("🚀 Task semanal disparada manualmente")

            return Response(
                {"message": "Task semanal disparada com sucesso", "task_id": task.id},
                status=status.HTTP_202_ACCEPTED,
            )

        except Exception as e:
            logger.error(f"❌ Erro ao disparar task semanal: {e}", exc_info=True)
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def get(self, request):
        task_id = request.query_params.get("task_id")

        if not task_id:
            return Response(
                {"error": "Parâmetro 'task_id' é obrigatório"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = AsyncResult(task_id)

        return Response(
            {
                "task_id": task_id,
                "status": result.status,
                "result": result.result if result.ready() else None,
            },
            status=status.HTTP_200_OK,
        )

