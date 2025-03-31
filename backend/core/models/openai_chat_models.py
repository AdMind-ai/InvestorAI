from django.db import models
from django.conf import settings


class ChatConversation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Conversation {self.id} - {self.user.username}"


class ChatMessage(models.Model):
    conversation = models.ForeignKey(
        ChatConversation, related_name='messages', on_delete=models.CASCADE)
    content = models.TextField(blank=True)
    is_user = models.BooleanField(default=True)

    file = models.FileField(upload_to="chat/files/", blank=True, null=True)
    file_url = models.URLField(max_length=200, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message {self.id} ({'User' if self.is_user else 'AI'})"
