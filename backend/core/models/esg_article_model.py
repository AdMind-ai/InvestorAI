from django.db import models
from core.models.company_info.company_info import CompanyInfo


class ESGArticle(models.Model):
    TOPIC_CHOICES = [
        ("Evoluzione del contesto normativo", "Evoluzione del contesto normativo"),
        ("Reati informativi", "Reati informativi"),
        ("Responsabilità amministratori", "Responsabilità amministratori"),
        ("Rischi reputazionali", "Rischi reputazionali")
    ]

    topic = models.CharField(max_length=100, choices=TOPIC_CHOICES)
    title = models.CharField(max_length=250)
    description = models.TextField()
    url = models.URLField(max_length=500)
    date_published = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Article - ESG"
        verbose_name_plural = "Articles - ESG"

    def __str__(self):
        return f"{self.topic} - {self.title}"
