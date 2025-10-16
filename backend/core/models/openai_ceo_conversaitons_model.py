from django.db import models
from core.models.company_info import CEO
from core.models.company_info.company_info import CompanyInfo

class CEOConversation(models.Model):
    company = models.ForeignKey(
        CompanyInfo,
        on_delete=models.CASCADE,
        related_name="ceo_conversations",
        help_text="Empresa associada à conversa."
    )
    ceo = models.ForeignKey(
        CEO,
        on_delete=models.CASCADE,
        related_name="conversations",
        help_text="CEO associado a esta conversa."
    )
    conversation_id = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,        
        help_text="ID da conversa usado para manter o contexto com a OpenAI."
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "CEO Conversation"
        verbose_name_plural = "CEO Conversations"
        unique_together = ("company", "ceo")

    def __str__(self):
        return f"{self.ceo.name} ({self.company.short_name})"
