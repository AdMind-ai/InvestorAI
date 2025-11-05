import json
import os
import requests
from django.http import StreamingHttpResponse
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser
from datetime import datetime
import locale
from core.serializers.perplexity_serializer import PerplexityRequestSerializer
from core.models.openai_chat_models import ChatConversation, ChatMessage
from core.tasks.tasks import deep_search_perplexity_async
from core.utils.get_company_info import get_user_company


SYSTEM_MESSAGE = (
    "You are an advanced deep search AI. Your role is to understand and process "
    "complex queries by dissecting the input, identifying key themes, and "
    "retrieving relevant and precise information. Ensure a thorough search "
    "through multiple data layers and provide well-structured, concise, and "
    "contextually appropriate results. Prioritize clarity, accuracy, and "
    "relevance in all of your responses."
)


class PerplexityDeepSearchView(APIView):
    # authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [FormParser, MultiPartParser, JSONParser]

    def get(self, request):
        return Response({"system_message": SYSTEM_MESSAGE})

    def post(self, request):
        user = request.user

        # 1. Salva placeholder no chat
        try:
            locale.setlocale(locale.LC_TIME, 'it_IT.UTF-8')
        except locale.Error:
            locale.setlocale(locale.LC_TIME, '')  # fallback
            
        tag = datetime.now().strftime("%d %B %Y %H:%M")
        # tag = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        conversation, _ = ChatConversation.objects.get_or_create(
            user=user, name=f"Overview del titolo - {tag}")
        waiting_message = ChatMessage.objects.create(
            conversation=conversation,
            content="processing",
            is_user=False,
            # name="deepsearch-placeholder"
        )
        # 2. Chama tarefa async (passe o chat/conversation/message ID como referência)
        company_info = get_user_company(user)
        if not company_info:
            return Response(
                {"error": "No company assigned to user."},
                status=400
            )
        company = company_info.long_name
        deep_search_perplexity_async.delay(
            conversation.id, waiting_message.id, company)
        return Response({
            "conversation_id": conversation.id,
            "waiting_message_id": waiting_message.id,
            "conversation_name": f"Overview del titolo - {tag}",
            "status": "processing"
        }, status=200)
