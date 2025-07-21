from django.db import models
from core.models.company_info import CEO
from core.models.company_info.company_info import CompanyInfo


class CEOArticle(models.Model):
    company = models.ForeignKey(
        CompanyInfo, related_name='ceo_articles', on_delete=models.CASCADE)
    personality = models.ForeignKey(
        CEO, on_delete=models.CASCADE, related_name="articles")
    title = models.CharField(max_length=250)
    author = models.CharField(max_length=100, default="Sconosciuto")
    content = models.TextField()
    source = models.CharField(max_length=150)
    url = models.URLField()
    language = models.CharField(max_length=30, default="Italian")
    date_published = models.DateField()
    sentiment = models.CharField(max_length=5, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    viewed = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Article - CEO"
        verbose_name_plural = "Articles - CEO"

    def __str__(self):
        return f"{self.personality} - {self.title}"
