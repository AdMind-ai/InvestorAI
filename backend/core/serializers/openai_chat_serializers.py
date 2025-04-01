from rest_framework import serializers
from core.models.openai_chat_models import ChatMessage, ChatConversation


class MessageSerializer(serializers.ModelSerializer):

    class Meta:
        model = ChatMessage
        fields = [
            'id', 'conversation', 'content',
            'file',
            'created_at',
        ]


class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatConversation
        fields = ['id', 'name', 'user', 'created_at', 'messages']

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Chat name cannot be empty.")
        return value
