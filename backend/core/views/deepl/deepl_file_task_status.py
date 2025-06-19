from celery.result import AsyncResult
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView


from celery.result import AsyncResult


class DeeplFileTaskStatusView(APIView):
    # authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        task_id = request.query_params.get('task_id')
        if not task_id:
            return Response({'detail': 'Task id is required'}, status=status.HTTP_400_BAD_REQUEST)
        result = AsyncResult(task_id)
        response_data = {
            "task_id": task_id,
            "status": result.status,
        }
        if result.ready():
            res = result.result

            if isinstance(res, Exception):
                response_data["error"] = str(res)
            else:
                response_data["result"] = res
        return Response(response_data, status=status.HTTP_200_OK)
