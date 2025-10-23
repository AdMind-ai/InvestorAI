from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework import status

from core.serializers.linkedin_scheduled_post import LinkedinScheduledPostSerializer
from core.models.linkedin_scheduled_post import LinkedinScheduledPost
from core.utils.get_company_info import get_user_company

import logging
logger = logging.getLogger(__name__)


class LinkedinScheduledPostView(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Cria um novo agendamento de post no LinkedIn.
        Espera: text, image (opcional), scheduled_at (ISO datetime)
        """
        company = get_user_company(request.user)
        if not company:
            return Response(
                {"detail": "Usuário não está associado a uma empresa."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        data = request.data.copy()
        data["company"] = company.id
        data["created_by"] = request.user.id

        # If an image file was uploaded, convert it to base64 and store in image_base64
        uploaded_image = request.FILES.get("image")
        if uploaded_image:
            try:
                import base64
                mime = uploaded_image.content_type or "application/octet-stream"
                encoded = base64.b64encode(uploaded_image.read()).decode("utf-8")
                data["image_base64"] = f"data:{mime};base64,{encoded}"
                # we do not save the uploaded file to any FileField/storage backend
            except Exception as e:
                logger.exception("Erro ao processar imagem enviada: %s", e)
                return Response({"detail": "Erro ao processar imagem."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = LinkedinScheduledPostSerializer(data=data)
        if serializer.is_valid():
            obj = serializer.save()
            return Response(
                LinkedinScheduledPostSerializer(obj).data,
                status=status.HTTP_201_CREATED,
            )

        logger.error("Erro ao criar post agendado: %s", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        """Lista todos os posts agendados da empresa do usuário."""
        company = get_user_company(request.user)
        if not company:
            return Response([], status=status.HTTP_200_OK)

        posts = LinkedinScheduledPost.objects.filter(company=company).order_by("-scheduled_at")
        serializer = LinkedinScheduledPostSerializer(posts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request):
        """Remove um post agendado (id obrigatório)."""
        post_id = request.data.get("id") or request.query_params.get("id")
        if not post_id:
            return Response({"detail": "id é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            post = LinkedinScheduledPost.objects.get(id=post_id)
            post.delete()
            return Response({"detail": "deletado"}, status=status.HTTP_200_OK)
        except LinkedinScheduledPost.DoesNotExist:
            return Response({"detail": "não encontrado"}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request):
        """Atualiza um post existente."""
        post_id = request.data.get("id")
        if not post_id:
            return Response({"detail": "id é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            post = LinkedinScheduledPost.objects.get(id=post_id)
        except LinkedinScheduledPost.DoesNotExist:
            return Response({"detail": "não encontrado"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()

        # If an image file was uploaded in the PUT, convert it to base64 and store in image_base64
        uploaded_image = request.FILES.get("image")
        if uploaded_image:
            try:
                import base64
                mime = uploaded_image.content_type or "application/octet-stream"
                encoded = base64.b64encode(uploaded_image.read()).decode("utf-8")
                data["image_base64"] = f"data:{mime};base64,{encoded}"
            except Exception as e:
                logger.exception("Erro ao processar imagem enviada no PUT: %s", e)
                return Response({"detail": "Erro ao processar imagem."}, status=status.HTTP_400_BAD_REQUEST)

        # If client provided image_base64 directly in the payload, it will be available in data

        serializer = LinkedinScheduledPostSerializer(post, data=data, partial=True)
        if serializer.is_valid():
            obj = serializer.save()
            return Response(LinkedinScheduledPostSerializer(obj).data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
