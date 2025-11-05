from rest_framework import serializers
from core.models.summary_news_model import SummaryNewsArticle


class SummaryNewsArticleSerializer(serializers.ModelSerializer):
    sources = serializers.SerializerMethodField()

    class Meta:
        model = SummaryNewsArticle
        fields = (
            'id', 'company', 'type', 'title', 'description', 'category',
            'relevance', 'created_at', 'sources'
        )

    def get_sources(self, obj):
        # The model currently stores sources in a URLField but tasks may save a list.
        # Be resilient: return a list if already a list; if it's a string, try to
        # parse by comma separation; if falsy, return empty list.
        urls = getattr(obj, 'sources_urls', None)
        if not urls:
            return []
        if isinstance(urls, (list, tuple)):
            return list(urls)
        if isinstance(urls, str):
            # split by commas and trim
            parts = [u.strip() for u in urls.split(',') if u.strip()]
            return parts
        # Fallback unknown type
        return []


class SummaryNewsListQuerySerializer(serializers.Serializer):
    type = serializers.ChoiceField(choices=['competitor', 'sector', 'client', 'fornitori'], required=False)
    category = serializers.CharField(required=False, allow_blank=True)
    relevance = serializers.ChoiceField(choices=['high', 'medium', 'low'], required=False)
    page = serializers.IntegerField(required=False, min_value=1, default=1)
    page_size = serializers.IntegerField(required=False, min_value=1, max_value=50, default=8)