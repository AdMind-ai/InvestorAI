from rest_framework import viewsets
from rest_framework.response import Response
from core.models.ceo_article_model import CEOArticle
from core.models.esg_article_model import ESGArticle
from .ceo_article_view import CEOArticleSerializer
from .esg_article_view import ESGArticleSerializer


class CombinedArticleViewSet(viewsets.ViewSet):
    def list(self, request, *args, **kwargs):
        esg_articles = ESGArticle.objects.all()
        ceo_articles = CEOArticle.objects.all()

        esg_data = ESGArticleSerializer(esg_articles, many=True).data
        ceo_data = CEOArticleSerializer(ceo_articles, many=True).data

        # Add new types of articles here if needed

        combined_data = {
            'esg': esg_data,
            'ceo': ceo_data,
            # 'other': other_data
        }

        return Response(combined_data)
