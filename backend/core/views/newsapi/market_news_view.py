import os
import re
import requests
from datetime import datetime, time, timedelta
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from core.models.competitor_model import CompetitorSearch
from core.models.market_article_model import MarketNewsArticle
from core.serializers.market_news_serializer import MarketNewsRequestSerializer
from core.utils.get_company_info import get_user_company, get_competitors
from core.utils.cron.market_news import fetch_news_thenewsapi, fetch_news_currentsapi, fetch_news_mediastack
from rest_framework import status
from django.db.models import Q

NEWS_API_KEY = os.environ.get("NEWSAPI_KEY")
CURR_NEWSAPI_KEY = os.environ.get("CURR_NEWSAPI_KEY")
MEDIASTACK_NEWSAPI_KEY = os.environ.get("MEDIASTACK_NEWSAPI_KEY")


class NewsApiMarketNewsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = MarketNewsRequestSerializer

    def post(self, request):
        serializer = MarketNewsRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        company = get_user_company(request.user)
        if not company:
            return Response(
                {"error": "No company assigned to user."},
                status=status.HTTP_400_BAD_REQUEST
            )
        company_name = company.short_name
        company_sector = company.sector
        news_type = serializer.validated_data['type']
        custom_query = serializer.validated_data.get('query', None)

        today = timezone.now().date()
        seven_days_ago = today - timedelta(days=7)
        since = seven_days_ago.isoformat()
        start_date = seven_days_ago.strftime("%Y-%m-%dT00:00:00Z")
        date_range = f"{seven_days_ago.strftime('%Y-%m-%d')},{today.strftime('%Y-%m-%d')}"

        # 1. Monta o query final se NÃO houver custom query
        if custom_query and custom_query.strip():
            q = custom_query
        else:
            q = f'"{company_name}"'
            if news_type == 'competitors':
                competitors = get_competitors(request.user)
                terms = []
                for c in competitors:
                    if c.name:
                        match = re.match(r'^(.+?)\s*\(([^)]+)\)\s*$', c.name)
                        if match:
                            name_pure = match.group(1).strip()
                            nickname = match.group(2).strip()
                            terms.append(f'"{name_pure}"')
                            terms.append(f'"{nickname}"')
                        else:
                            terms.append(f'"{c.name.strip()}"')
                q = " | ".join(terms)
            elif news_type == 'sector':
                sectors = [s.strip()
                           for s in company_sector.split(',') if s.strip()]
                if sectors:
                    q = ' | '.join(f'"{s}"' for s in sectors)
                else:
                    q = f'"{company_name}"'

        # 2. Consulta nas três APIs
        results = []
        results += fetch_news_thenewsapi(q, since, NEWS_API_KEY)
        results += fetch_news_currentsapi(q, start_date, CURR_NEWSAPI_KEY)
        results += fetch_news_mediastack(q, date_range, MEDIASTACK_NEWSAPI_KEY)

        # 3. Salva e prepara o retorno
        valid_articles = []
        count_saved = 0
        for item in results:
            date_str = item.get("date_published")
            date_published = None
            if date_str:
                try:
                    if "T" in date_str:
                        date_published = datetime.fromisoformat(
                            date_str.replace("Z", "+00:00")).date()
                    else:
                        date_published = datetime.strptime(
                            date_str[:10], "%Y-%m-%d").date()
                except Exception:
                    date_published = None
            if date_published:
                obj, created = MarketNewsArticle.objects.get_or_create(
                    company=company_name,
                    type=news_type,
                    title=item.get("title"),
                    defaults={
                        'url': item.get("url"),
                        'date_published': date_published,
                    }
                )
                if created:
                    count_saved += 1
            valid_articles.append({
                "title": item.get("title"),
                "url": item.get("url"),
                "date_published": date_published.isoformat() if date_published else None,
                "source": item.get("source")
            })

        return Response({
            "articles": valid_articles,
            "news_saved": count_saved,
            "query": q
        }, status=200)

    def get(self, request):
        news_type = request.query_params.get('type')

        queryset = MarketNewsArticle.objects.all()

        company = get_user_company(request.user)
        if not company:
            return Response(
                {"error": "No company assigned to user."},
                status=status.HTTP_400_BAD_REQUEST
            )
        company_short = company.short_name
        company_long = company.long_name
        
        if company_short or company_long:
            queryset = queryset.filter(
                Q(company__iexact=company_short) | Q(company__iexact=company_long)
            )

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
                    "date_published": article.date_published,
                    "created_at": article.created_at
                })

        return Response({"articles": articles_data}, status=200)
