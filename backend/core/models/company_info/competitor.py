from django.db import models
from core.models.company_info import CompanyInfo


class CompetitorInfo(models.Model):
    company = models.ForeignKey(
        CompanyInfo, related_name='competitors', on_delete=models.CASCADE)
    sectors_company = models.CharField(max_length=255, blank=True)
    name = models.CharField(max_length=255)
    stock_symbol = models.CharField(max_length=32, blank=True)
    website = models.URLField(blank=True, null=True)
    # extra fields for CompetitorInfo
    logo = models.URLField(blank=True, null=True)
    sectors_competitor = models.JSONField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now=True, blank=True, null=True)

    class Meta:
        verbose_name = "Competitor - Info"
        verbose_name_plural = "Competitors - Info"

    def __str__(self):
        return f"{self.name} ({self.stock_symbol if self.stock_symbol else 'No Symbol'})"
