from django.db import models


class CompanyStockData(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    date = models.CharField(max_length=50)
    company = models.CharField(max_length=50)
    stock_symbol = models.CharField(max_length=20)
    stock_exchange = models.CharField(max_length=20)
    stock_price_today_usd = models.FloatField(null=True, blank=True)
    stock_price_today_eur = models.FloatField(null=True, blank=True)
    market_cap_usd = models.CharField(max_length=50, null=True, blank=True)
    market_cap_eur = models.CharField(max_length=50, null=True, blank=True)
    pe_ratio = models.FloatField(null=True, blank=True)
    sector = models.CharField(max_length=50, null=True, blank=True)
    stock_volatility_level = models.CharField(
        max_length=50, null=True, blank=True)
    short_term_forecast = models.TextField(null=True, blank=True)
    possible_risk_factors = models.TextField(null=True, blank=True)
    latest_news = models.TextField(null=True, blank=True)
    analyst_recommendation = models.CharField(
        max_length=200, null=True, blank=True)

    def __str__(self):
        return f"{self.company} - {self.stock_symbol} ({self.date})"
