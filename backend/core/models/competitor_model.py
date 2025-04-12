from django.db import models


class CompetitorSearch(models.Model):
    company_name = models.CharField(max_length=255)
    search_date = models.DateField(auto_now_add=True)
    sector = models.CharField(max_length=255, default='Technology')


class Competitor(models.Model):
    search = models.ForeignKey(
        CompetitorSearch, related_name='competitors', on_delete=models.CASCADE)
    competitor = models.CharField(max_length=255)
    logo = models.URLField()
    sectors = models.JSONField()
    description = models.TextField()
    website = models.URLField()

    def __str__(self):
        return self.competitor
