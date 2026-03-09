from django.conf import settings
from django.db import models

from core.models.company_info.company_info import CompanyInfo


class GlossaryEntry(models.Model):
    company = models.ForeignKey(
        CompanyInfo,
        on_delete=models.CASCADE,
        related_name="glossary_entries",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="glossary_entries",
    )
    original = models.CharField(max_length=255)
    translation = models.CharField(max_length=255, blank=True, default="")
    target_langs = models.JSONField(default=list, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Glossary Entry"
        verbose_name_plural = "Glossary Entries"
        ordering = ["id"]
        indexes = [
            models.Index(fields=["company", "created_by"]),
            models.Index(fields=["company"]),
            models.Index(fields=["created_by"]),
        ]

    def __str__(self):
        return f"{self.original} -> {self.translation or self.original}"
