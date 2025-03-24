# core/views.py
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import viewsets, serializers
from core.models.esg_article_model import ESGArticle


class ESGArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ESGArticle
        fields = '__all__'


class ESGArticleViewSet(viewsets.ModelViewSet):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    queryset = ESGArticle.objects.all()
    serializer_class = ESGArticleSerializer
