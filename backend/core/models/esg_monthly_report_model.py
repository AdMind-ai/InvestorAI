from django.db import models
from core.models.company_info.company_info import CompanyInfo


class ESGMonthlyReport(models.Model):
    """Stores the generated monthly ESG news report for a company.

    Unique per (company, report_period). The report_period is stored as the
    first day of the month for easy querying and uniqueness enforcement.
    """

    company = models.ForeignKey(
        CompanyInfo,
        on_delete=models.CASCADE,
        related_name="esg_monthly_reports",
    )
    report_period = models.DateField(
        help_text="First day of the month this report covers (e.g. 2025-09-01)."
    )
    report_name = models.CharField(max_length=150)
    report_description = models.TextField(
        help_text="Full markdown/text content of the monthly ESG report."
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "ESG Monthly Report"
        verbose_name_plural = "ESG Monthly Reports"
        unique_together = ("company", "report_period")

    def __str__(self):
        return f"{self.company.short_name} - {self.report_name} ({self.report_period:%Y-%m})"
