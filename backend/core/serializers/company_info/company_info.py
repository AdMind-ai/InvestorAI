from rest_framework import serializers
from core.models.company_info import CompanyInfo, RelatedCompany, CEO


class CompetitorSerializer(serializers.ModelSerializer):
    class Meta:
        model = RelatedCompany
        fields = ['name', 'stock_symbol',
                  'sectors', 'website', 'created_at', 'description', 'logo']


class CEOSerializer(serializers.ModelSerializer):
    class Meta:
        model = CEO
        fields = ['name', 'role']


class CompanySerializer(serializers.ModelSerializer):
    competitors = CompetitorSerializer(many=True)
    ceos = CEOSerializer(many=True)

    class Meta:
        model = CompanyInfo
        fields = [
            'long_name',
            'short_name',
            'stock_symbol',
            'website',
            'description',
            'sector',
            'sector_keywords',
            'sector_websites',
            'country',
            'state',
            'city',
            'address',
            'phone',
            'email',
            'competitors',
            'ceos',
            'sources'
        ]

