from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets, permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import FormParser, MultiPartParser, JSONParser

from core.models.openai_chat_models import ChatConversation
from core.serializers.openai_chat_serializers import ConversationSerializer


class OpenAIConversationViewSet(viewsets.ModelViewSet):
    queryset = ChatConversation.objects.all()
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    parser_classes = [FormParser, MultiPartParser, JSONParser]

    def get_queryset(self):
        user = self.request.user
        return ChatConversation.objects.filter(user=user)

    def perform_destroy(self, instance):
        print(
            f"Deleting chat with ID: {instance.id} and Name: {instance.name}")
        instance.delete()
