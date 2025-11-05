from rest_framework import serializers
from core.models.company_info import CompanyInfo


class CompanySectorUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyInfo
        fields = [
            'description',
            'sector_keywords',
            'sector_websites',
        ]
