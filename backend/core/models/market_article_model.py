from django.db import models


class MarketNewsArticle(models.Model):
    TYPE_CHOICES = [
        ('sector', 'Sector'),
        ('competitors', 'Competitors'),
    ]

    company = models.CharField(max_length=255)
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
