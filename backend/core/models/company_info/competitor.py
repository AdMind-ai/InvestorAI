from django.db import models
from core.models.company_info.company_info import CompanyInfo


class RelatedCompany(models.Model):
    KIND_CHOICES = [
        ("competitor", "Competitor"),
        ("client", "Client"),
        ("fornitori", "Fornitori"),
    ]

    company = models.ForeignKey(
        CompanyInfo,
        related_name="related_companies",
        on_delete=models.CASCADE,
    )
    kind = models.CharField(max_length=16, choices=KIND_CHOICES)

    # basic info about the related entity
    name = models.CharField(max_length=255)
    stock_symbol = models.CharField(max_length=32, blank=True)
    website = models.URLField(blank=True, null=True)
    logo = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    # sectors or tags related to this related company
    sectors = models.JSONField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Related Company"
        verbose_name_plural = "Related Companies"

    def __str__(self):
        return f"{self.name} ({self.get_kind_display()})"
