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
    # Filter only related_companies with kind='competitor'
    competitors = serializers.SerializerMethodField()
    ceos = CEOSerializer(many=True, read_only=True)

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
            'sources',
            'competitors',
            'ceos'
        ]

    def get_competitors(self, obj):
        # Use prefetched list when available to avoid extra queries
        comps = getattr(obj, 'prefetched_competitors', None)
        if comps is None:
            comps = obj.related_companies.filter(kind='competitor')
        return CompetitorSerializer(comps, many=True).data

