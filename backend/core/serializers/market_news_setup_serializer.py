from rest_framework import serializers
from core.models.market_article_model import MarketNewsSetup

class MarketingNewsSetupSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source="company.short_name", read_only=True)

    class Meta:
        model = MarketNewsSetup
        fields = ["id", "company", "company_name", "is_configured", "configured_at"]
        read_only_fields = ["configured_at"]
