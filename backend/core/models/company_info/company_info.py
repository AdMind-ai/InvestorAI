from django.db import models


class CompanyInfo(models.Model):
    long_name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=255)
    stock_symbol = models.CharField(max_length=32, blank=True)
    website = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True)
    sector = models.CharField(max_length=255, blank=True)
    sector_keywords = models.JSONField(
        blank=True, null=True, default=list,
        help_text="List of keywords describing the company's sector."
    )
    sector_websites = models.JSONField(
        blank=True, null=True, default=list,
        help_text="List of custom URLs provided by the user for sector intelligence."
    )
    country = models.CharField(max_length=64, blank=True)
    state = models.CharField(max_length=64, blank=True)
    city = models.CharField(max_length=64, blank=True)
    address = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=64, blank=True)
    email = models.EmailField(blank=True)
    sources = models.TextField(
        blank=True, null=True,
        help_text="List of URLs from reliable sources for reports, one per line."
    )

    class Meta:
        verbose_name = "Company - Info"
        verbose_name_plural = "Companies - Info"

    def __str__(self):
        return self.long_name
