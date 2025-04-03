# core/views.py
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import viewsets, serializers
from core.models.ceo_article_model import CEOArticle
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status


class CEOArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CEOArticle
        fields = '__all__'


class CEOArticleViewSet(viewsets.ModelViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = CEOArticle.objects.all()
    serializer_class = CEOArticleSerializer

    @action(detail=True, methods=['put'])
    def mark_viewed(self, request, pk=None):
        try:
            article = self.get_object()
            article.viewed = True
            article.save()
            return Response({'status': 'Article marked as viewed'}, status=status.HTTP_200_OK)
        except CEOArticle.DoesNotExist:
            return Response({'error': 'Article not found'}, status=status.HTTP_404_NOT_FOUND)
