from django.db import models
from core.models.company_info.company_info import CompanyInfo

class MarketNewsArticle(models.Model):
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
        related_name="market_articles_fk"
    )
    type = models.CharField(max_length=12, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    url = models.URLField()
    date_published = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    category = models.CharField(max_length=64, blank=True)

    RELEVANCE_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    # relevance assigned by classification / user preference mapping
    relevance = models.CharField(max_length=6, choices=RELEVANCE_CHOICES, null=True, blank=True)

    class Meta:
        verbose_name = "Market News - Article"
        verbose_name_plural = "Market News - Articles"

    def __str__(self):
        return self.title

class MarketNewsSetup(models.Model):
    """
    This checks if a company has already set up marketing news retrieval.
    """

    company = models.OneToOneField(
        CompanyInfo,
        on_delete=models.CASCADE,
        related_name="marketing_news_setup"
    )
    is_configured = models.BooleanField(default=False)
    configured_at = models.DateTimeField(auto_now=True)
    
    # Criar campos para conversation_id da openai 
    # Será usado para guardar o contexto da conversa dos chats: 
    # MI01, MI02, MI03, MI04
    conversation_id_mi01 = models.CharField(max_length=255, null=True, blank=True)
    conversation_id_mi02 = models.CharField(max_length=255, null=True, blank=True)
    conversation_id_mi03 = models.CharField(max_length=255, null=True, blank=True)
    conversation_id_mi04 = models.CharField(max_length=255, null=True, blank=True)  

    class Meta:
        verbose_name = "Marketing News Setup"
        verbose_name_plural = "Marketing News Setups"

    def __str__(self):
        return f"{self.company.short_name} - {'Configured' if self.is_configured else 'Not configured'}"
