from django.db import models
from core.models.company_info.company_info import CompanyInfo

class SummaryNewsArticle(models.Model):
    TYPE_CHOICES = [
        ('sector', 'Sector'),
        ('competitor', 'Competitor'),
        ('client', 'Client'),
        ('fornitori', 'Fornitori'),
    ]

    company = models.CharField(max_length=255)
    company_fk = models.ForeignKey(
        CompanyInfo,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="market_summary_articles_fk"
    )
    type = models.CharField(max_length=12, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=64, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    RELEVANCE_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    # relevance assigned by classification / user preference mapping
    relevance = models.CharField(max_length=6, choices=RELEVANCE_CHOICES, null=True, blank=True)

    sources_urls = models.URLField(default=list, blank=True)
    
    class Meta:
        verbose_name = "Market News - Summary Article"
        verbose_name_plural = "Market News - Summary Articles"

    def __str__(self):
        return self.title