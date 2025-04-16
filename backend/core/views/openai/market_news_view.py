from typing import List
from pydantic import BaseModel, HttpUrl
from django.utils import timezone
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from openai import OpenAI
from core.models.competitor_model import CompetitorSearch
from core.models.market_article_model import MarketNewsArticle
from core.serializers.market_news_serializer import MarketNewsRequestSerializer
import requests
import os

client = OpenAI(api_key=os.getenv('OPENAI_KEY'))


class NewsArticle(BaseModel):
    title: str
    url: str
    date_published: str


class NewsArticleList(BaseModel):
    articles: List[NewsArticle]


class OpenAIMarketNewsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = MarketNewsRequestSerializer

    def post(self, request):
        serializer = MarketNewsRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        company_name = serializer.validated_data['company']
        news_type = serializer.validated_data['type']

        if not company_name or news_type not in ['competitors', 'sector']:
            return Response({"error": "Company name and valid type ('competitors' or 'sector') are required."}, status=400)

        today = timezone.now().date()

        search_type = ''
        if news_type == 'competitors':
            try:
                latest_search = CompetitorSearch.objects.filter(
                    company_name__iexact=company_name).latest('search_date')
                competitors = latest_search.competitors.values_list(
                    'competitor', flat=True)
                target = "any of this companies: " + ', '.join(competitors)
                search_type = '<company name>'
            except CompetitorSearch.DoesNotExist:
                return Response({"error": "No recent competitors found for this company."}, status=404)

        elif news_type == 'sector':
            try:
                latest_search = CompetitorSearch.objects.filter(
                    company_name__iexact=company_name).latest('search_date')
                sector = latest_search.sector
            except CompetitorSearch.DoesNotExist:
                print(f"No record found for {company_name}.")
            target = f"{sector} sector news relevant to {company_name} (No need to include the company name in the search)"
            search_type = f'<{sector}>'

        prompt = f"""
        Find up to 8 relevant news articles about {target} published on {today}.
        Try searching terms like "{search_type} latest news", "{search_type} recent news" or "{search_type} today's news" to find articles published on the same day.

        REQUIRED PROCEDURE:
        - Use web search to find only news articles published STRICTLY on the date {today}. Avoid educational or informational sites.
        - Confirm that each URL works correctly and leads directly to the article, and place this in the URL field.
        - Use reliable and well-known news sources.
        - Avoid duplicate or overly similar news articles from the same publisher or network.
        """
        system = f"""
        You are an AI designed to find recent, accurate, and trustworthy news articles published strictly on the following date: {today}.

        MANDATORY RULES:
        1. NEVER invent news articles or use unverified information.
        2. Ensure the content comes exclusively from news articles, avoiding educational sites or factual summaries.
        3. Use the integrated web search to verify that each article exists and that each URL is functional and directly leads to the article (no paywalls, errors, or redirects).
        4. Only use reliable and well-known news sources.
        """
        response = client.beta.chat.completions.parse(
            model="gpt-4o-search-preview",
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            response_format=NewsArticleList,
            web_search_options={
                "search_context_size": "high"
            },
            max_completion_tokens=10000,
        )

        news_data = response.choices[0].message.parsed.model_dump()
        print(news_data, type(news_data), '\n\n')

        valid_articles = []
        for article in news_data['articles']:
            try:
                response = requests.head(article['url'])
                is_valid_url = response.status_code == 200
                article_date = datetime.fromisoformat(
                    article['date_published']).date()

                if is_valid_url and article_date == today:
                    MarketNewsArticle.objects.create(
                        company=company_name,
                        type=news_type,
                        title=article['title'],
                        url=article['url'],
                        date_published=article_date
                    )
                    valid_articles.append(article)

            except (requests.RequestException, KeyError, ValueError):
                continue

        return Response({"articles": valid_articles}, status=200)

    def get(self, request):
        company_name = request.query_params.get('company')
        news_type = request.query_params.get('type')

        queryset = MarketNewsArticle.objects.all()

        if company_name:
            queryset = queryset.filter(company__iexact=company_name)

        if news_type:
            queryset = queryset.filter(type=news_type)

        queryset = queryset.order_by('-created_at')

        articles_data = [
            {
                "company": article.company,
                "type": article.type,
                "title": article.title,
                "url": article.url,
                "date_published": article.date_published,
                "created_at": article.created_at
            }
            for article in queryset
        ]

        return Response({"articles": articles_data}, status=200)
