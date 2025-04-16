from django.db import models


class CompanyQuarterlyReport(models.Model):
    QUARTERS = [
        ('Q1', 'Q1'),
        ('Q2', 'Q2'),
        ('Q3', 'Q3'),
        ('Q4', 'Q4'),
    ]

    company = models.CharField(max_length=100)
    quarter = models.CharField(max_length=2, choices=QUARTERS)
    year = models.PositiveIntegerField()
    press_release = models.URLField()
    financial_statements = models.URLField()
    form_10k = models.URLField(blank=True, null=True)
    insight_report = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-year', '-quarter']

    def __str__(self):
        return f"{self.company} {self.quarter} {self.year}"
