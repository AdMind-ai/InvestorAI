from rest_framework import serializers
from core.models.feature_usage import FeatureUsage
from core.models.company_info.company_info import CompanyInfo


class FeatureUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeatureUsage
        fields = ('module', 'feature', 'company', 'count', 'max_limit', 'last_used')
