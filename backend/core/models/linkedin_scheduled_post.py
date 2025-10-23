from django.db import models
from core.models.company_info.company_info import CompanyInfo
from django.conf import settings


class LinkedinScheduledPost(models.Model):
    company = models.ForeignKey(
        CompanyInfo,
        on_delete=models.CASCADE,
        related_name="linkedin_scheduled_posts",
        help_text="Empresa associada ao post"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="linkedin_scheduled_posts",
        help_text="Usuário que criou o agendamento"
    )

    text = models.TextField(blank=True, null=True)
    # Store the base64 representation of the image so we don't rely on external storage
    image_base64 = models.TextField(null=True, blank=True, help_text="Base64 encoded image data (data:<mime>;base64,<payload>)")

    scheduled_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "LinkedIn Scheduled Post"
        verbose_name_plural = "LinkedIn Scheduled Posts"

    def __str__(self):
        return f"Post {self.id} - {self.company.short_name if self.company else 'no-company'}"
