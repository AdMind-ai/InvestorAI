from django.db import models
from core.models.company_info import CEO
from core.models.company_info.company_info import CompanyInfo


class CEOArticle(models.Model):
    personality = models.ForeignKey(
        CEO, on_delete=models.CASCADE, related_name="articles"
    )
    title = models.CharField(max_length=250)
    author = models.CharField(max_length=100, default="Sconosciuto", blank=True, null=True)
    content = models.TextField(blank=True, null=True)
    source = models.CharField(max_length=150, blank=True, null=True)
    # Unicidade agora será por personalidade+url (ver Meta.unique_together); removido unique=True global
    url = models.URLField()
    language = models.CharField(max_length=30, default="Italian", blank=True, null=True)
    date_published = models.DateField(blank=True, null=True)
    sentiment = models.CharField(max_length=5, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    viewed = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Article - CEO"
        verbose_name_plural = "Articles - CEO"
        # Evita duplicar título para mesma personalidade e também mesma URL para mesma personalidade
        unique_together = (
            ('title', 'personality'),
            ('personality', 'url'),
        )

    def __str__(self):
        return f"{self.personality} - {self.title}"
