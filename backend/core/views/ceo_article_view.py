# core/views.py
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import viewsets, serializers
from core.models.ceo_article_model import CEOArticle
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status


class CEOArticleSerializer(serializers.ModelSerializer):
    personality_name = serializers.CharField(
        source='personality.name', read_only=True)

    class Meta:
        model = CEOArticle
        fields = '__all__'


class CEOArticleViewSet(viewsets.ModelViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = CEOArticleSerializer

    def get_queryset(self):
        """
        Retorna todos os artigos ou filtra pelo name do CEO se passado na query string.
        Ex: /articles/ceo/?name=Elon%20Musk
        """
        queryset = CEOArticle.objects.all()
        ceo_name = self.request.query_params.get('name')
        if ceo_name:
            queryset = queryset.filter(personality__name=ceo_name)
        return queryset.order_by('-date_published')

    @action(detail=True, methods=['put'])
    def mark_viewed(self, request, pk=None):
        try:
            article = self.get_object()
            article.viewed = True
            article.save()
            return Response({'status': 'Article marked as viewed'}, status=status.HTTP_200_OK)
        except CEOArticle.DoesNotExist:
            return Response({'error': 'Article not found'}, status=status.HTTP_404_NOT_FOUND)
