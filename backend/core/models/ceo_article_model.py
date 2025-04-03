from django.db import models


class CEOArticle(models.Model):
    PERSONALITY_CHOICES = [
        ("Mario Rossi", "Mario Rossi"),
        ("Elvira Giacomelli", "Elvira Giacomelli"),
        ("Luigi Farris", "Luigi Farris"),
    ]

    personality = models.CharField(max_length=100, choices=PERSONALITY_CHOICES)
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

    def __str__(self):
        return f"{self.personality} - {self.title}"
