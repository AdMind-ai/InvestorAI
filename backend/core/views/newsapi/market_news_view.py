import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from core.models.market_article_model import MarketNewsArticle
from core.serializers.market_news_serializer import MarketNewsRequestSerializer
from core.utils.get_company_info import get_user_company
from rest_framework import status
from django.db.models import Q

class NewsApiMarketNewsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = MarketNewsRequestSerializer

    def get(self, request):
        news_type = request.query_params.get('type')

        queryset = MarketNewsArticle.objects.all()

        company = get_user_company(request.user)
        if not company:
            return Response(
                {"error": "No company assigned to user."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = queryset.filter(company_fk=company)

        if news_type:
            queryset = queryset.filter(type=news_type)

        queryset = queryset.order_by('-created_at')

        seen_titles_urls = set()
        articles_data = []

        for article in queryset:
            key = (article.title, article.url)
            if key in seen_titles_urls:
                continue
            seen_titles_urls.add(key)
            
            articles_data.append(
                {
                    "company": article.company,
                    "type": article.type,
                    "title": article.title,
                    "url": article.url,
                    "category": article.category,
                    "relevance": article.relevance or '',
                    "created_at": article.created_at,
                    "date_published": article.date_published,
                })
            
              
        return Response({"articles": articles_data}, status=200)
