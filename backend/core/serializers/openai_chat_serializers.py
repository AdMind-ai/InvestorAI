from rest_framework import serializers
from core.models.openai_chat_models import ChatMessage, ChatConversation


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = [
            'id', 'content', 'is_user',
            'file',
            'created_at',
        ]


class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatConversation
        fields = ['id', 'user', 'created_at', 'messages']
