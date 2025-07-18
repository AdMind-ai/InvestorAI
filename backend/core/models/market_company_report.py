from django.db import models


class CompanyMarketReport(models.Model):
    company = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    report = models.TextField()
    citations = models.TextField(null=True, blank=True)

    class Meta:
        verbose_name = "Company - Market Report"
        verbose_name_plural = "Companies - Market Reports"

    def __str__(self):
        return f"Report for {self.company} at {self.created_at}"
