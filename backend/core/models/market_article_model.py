from django.db import models
from core.models.company_info.company_info import CompanyInfo


class MarketNewsArticle(models.Model):
    TYPE_CHOICES = [
        ('sector', 'Sector'),
        ('competitors', 'Competitors'),
    ]

    company = models.ForeignKey(
        CompanyInfo, related_name="news_articles", default=1, on_delete=models.CASCADE)
    type = models.CharField(max_length=12, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    url = models.URLField()
    date_published = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Article - Market News"
        verbose_name_plural = "Articles - Market News"

    def __str__(self):
        return self.title
