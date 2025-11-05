from django.db import models
from core.models.company_info.company_info import CompanyInfo


class MarketNewsAlertPreference(models.Model):
    CATEGORY_CHOICES = [
        ("sector", "Sector"),
        ("competitors", "Competitors"),
        ("clients", "Clients"),
        ("fornitori", "Fornitori"),
    ]

    RELEVANCE_CHOICES = [
        ("high", "High"),
        ("medium", "Medium"),
        ("low", "Low"),
    ]

    company = models.ForeignKey(
        CompanyInfo,
        related_name="alert_preferences",
        on_delete=models.CASCADE,
    )
    email = models.EmailField()
    category = models.CharField(max_length=16, choices=CATEGORY_CHOICES)
    enabled = models.BooleanField(default=True)
    relevance = models.CharField(max_length=6, choices=RELEVANCE_CHOICES, default="high")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Market News - Alert Preference"
        verbose_name_plural = "Market News - Alert Preferences"

    def __str__(self):
        return f"{self.email} - {self.company} - {self.category} ({self.relevance})"
