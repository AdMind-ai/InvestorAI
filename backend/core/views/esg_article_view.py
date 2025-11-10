# core/views.py
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import viewsets, serializers
from core.models.esg_article_model import ESGArticle
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from core.models.esg_monthly_report_model import ESGMonthlyReport  # kept for mark_viewed only (reports moved to separate views)


class ESGArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ESGArticle
        fields = '__all__'


class ESGArticleViewSet(viewsets.ModelViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = ESGArticle.objects.all()
    serializer_class = ESGArticleSerializer
    
    def get_queryset(self):
        """
        Retorna todos os artigos ou filtra pelo topico
        """
        queryset = ESGArticle.objects.all()
        topic = self.request.query_params.get('topic')
        if topic:
            queryset = queryset.filter(topic=topic)
        return queryset

    @action(detail=True, methods=['put'])
    def mark_viewed(self, request, pk=None):
        try:
            article = self.get_object()
            article.viewed = True
            article.save()
            return Response({'status': 'Article marked as viewed'}, status=status.HTTP_200_OK)
        except ESGArticle.DoesNotExist:
            return Response({'error': 'Article not found'}, status=status.HTTP_404_NOT_FOUND)

    # Task & monthly report actions were moved to dedicated view classes.
