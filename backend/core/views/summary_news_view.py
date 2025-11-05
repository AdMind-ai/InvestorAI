from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from core.models.summary_news_model import SummaryNewsArticle
from core.serializers.summary_news_serializer import (
    SummaryNewsArticleSerializer,
    SummaryNewsListQuerySerializer,
)
from core.utils.get_company_info import get_user_company


class SummaryNewsListView(APIView):
    """
    GET → Returns paginated list of SummaryNewsArticle for the user's company.
    Query params:
      - type: competitor|sector|client|fornitori
      - category: optional string
      - relevance: high|medium|low
      - page: default 1
      - page_size: default 8 (max 50)
    """

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        qs_serializer = SummaryNewsListQuerySerializer(data=request.query_params)
        qs_serializer.is_valid(raise_exception=True)
        params = qs_serializer.validated_data

        company = get_user_company(request.user)
        if not company:
            return Response({"error": "No company found for this user."}, status=404)

        queryset = SummaryNewsArticle.objects.filter(company_fk=company)

        if t := params.get('type'):
            queryset = queryset.filter(type=t)

        if cat := params.get('category'):
            queryset = queryset.filter(category__iexact=cat)

        if rel := params.get('relevance'):
            queryset = queryset.filter(relevance=rel)

        queryset = queryset.order_by('-created_at')

        page = params.get('page', 1)
        page_size = params.get('page_size', 8)
        start = (page - 1) * page_size
        end = start + page_size
        total = queryset.count()

        items = queryset[start:end]
        data = SummaryNewsArticleSerializer(items, many=True).data

        return Response({
            'page': page,
            'page_size': page_size,
            'total': total,
            'results': data,
        })
