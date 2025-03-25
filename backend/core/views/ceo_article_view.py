# core/views.py
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import viewsets, serializers
from core.models.ceo_article_model import CEOArticle


class CEOArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CEOArticle
        fields = '__all__'


class CEOArticleViewSet(viewsets.ModelViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = CEOArticle.objects.all()
    serializer_class = CEOArticleSerializer
