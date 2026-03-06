from django.conf import settings
from django.db import models

from core.models.company_info.company_info import CompanyInfo


class DeepLGlossaryReference(models.Model):
    """
    Stores reference to DeepL glossary created via API.
    Each company/user can have multiple glossaries for different language pairs.
    """
    company = models.ForeignKey(
        CompanyInfo,
        on_delete=models.CASCADE,
        related_name="deepl_glossaries",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="deepl_glossaries",
    )
    
    # DeepL glossary ID returned by API
    deepl_glossary_id = models.CharField(max_length=255, unique=True, db_index=True)
    
    # Glossary name in DeepL
    glossary_name = models.CharField(max_length=255)
    
    # Scope: 'user' or 'company'
    scope = models.CharField(max_length=10, default="company")
    
    # Track language pairs this glossary supports (for quick lookup)
    # Format: [{"source": "EN", "target": "DE"}, {"source": "EN", "target": "FR"}]
    language_pairs = models.JSONField(default=list, blank=True)
    
    # Number of entries in DeepL glossary
    entry_count = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Track last sync with DeepL
    last_synced_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "DeepL Glossary Reference"
        verbose_name_plural = "DeepL Glossary References"
        ordering = ["-updated_at"]
        indexes = [
            models.Index(fields=["company", "scope"]),
            models.Index(fields=["created_by", "scope"]),
            models.Index(fields=["deepl_glossary_id"]),
        ]
        unique_together = [["company", "created_by", "scope"]]

    def __str__(self):
        return f"{self.glossary_name} ({self.deepl_glossary_id}) - {self.scope}"
