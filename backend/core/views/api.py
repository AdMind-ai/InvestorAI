from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.urls import reverse
from core.models.core_model import CoreModel
from core.serializers.core_serializer import CoreSerializer


class CoreViewSet(viewsets.ModelViewSet):
    """
    ViewSet to manage application data.
    """
    queryset = CoreModel.objects.all()
    serializer_class = CoreSerializer
    permission_classes = [permissions.IsAuthenticated]


class APIRootView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user_id = request.user.id
        return Response({
            # "main": request.build_absolute_uri(reverse("api-root")),
            "company": request.build_absolute_uri(reverse("company-info-adm")),
            "newsapi": request.build_absolute_uri(reverse("newsapi-market-news")),
            "quickdoc-generate": request.build_absolute_uri(reverse("quickdoc-generate")),
            "smartscan-extract": request.build_absolute_uri(reverse("smartscan-extract")),
            "smartscan-chat": request.build_absolute_uri(reverse("smartscan-chat")),
            "users": {
                "token_obtain": request.build_absolute_uri(reverse("token_obtain_pair")),
                "token_refresh": request.build_absolute_uri(reverse("token_refresh")),
                "user_register": request.build_absolute_uri(reverse("register_user")),
                "users_list": request.build_absolute_uri(reverse("users-list")),
                "user_detail_current": request.build_absolute_uri(reverse("users-detail", kwargs={'pk': user_id})),
            },
            "core": {
                "perplexity": {
                    "deep-search": request.build_absolute_uri(reverse("deep-search")),
                    "esg-news": request.build_absolute_uri(reverse("perplexity-esg-news")),
                    "ceo-news": request.build_absolute_uri(reverse("perplexity-ceo-news")),
                    "market-report": request.build_absolute_uri(reverse("monthly-market-report")),
                    "generate-pdf-market-report": request.build_absolute_uri(reverse("generate-pdf-monthly-market-report")),
                },
                "deepl": {
                    "file": request.build_absolute_uri(reverse("translate-file")),
                    "text": request.build_absolute_uri(reverse("translate-text")),
                },
                "openai": {
                    "audio-transcription": request.build_absolute_uri(reverse("audio-transcription")),
                    "esg-news": request.build_absolute_uri(reverse("openai-esg-news")),
                    "ceo-news": request.build_absolute_uri(reverse("openai-ceo-news")),
                    "market-news": request.build_absolute_uri(reverse("openai-market-news")),
                    "competitors-search": request.build_absolute_uri(reverse("openai-competitors-search")),
                    "investing-scraper": request.build_absolute_uri(reverse("get_investing_data")),
                    "quarterly-report": request.build_absolute_uri(reverse("openai-quarterly-report")),
                    "chat-conversation": request.build_absolute_uri(reverse("openai-chat-conversation-list")),
                    "chat-send-message": request.build_absolute_uri(reverse("openai-chat-send-message")),
                    "create-conversation": request.build_absolute_uri(reverse("openai-chat-create-conversation")),
                    "save-conversation": request.build_absolute_uri(reverse("openai-chat-save-conversation")),
                },
                "elevenlabs": {
                    "text-to-speech": request.build_absolute_uri(reverse("text-to-speech")),
                },
                "articles": {
                    "articles": request.build_absolute_uri(reverse("articles-list")),
                    "esg-articles": request.build_absolute_uri(reverse("esgarticle-list")),
                    "ceo-articles": request.build_absolute_uri(reverse("ceoarticle-list")),
                },
                "stock": {
                    "stock-data": request.build_absolute_uri(reverse("stock-data")),
                    "company-info": request.build_absolute_uri(reverse("company-info")),
                    "search-stocks": request.build_absolute_uri(reverse("search-stocks")),
                    "fast-info": request.build_absolute_uri(reverse("fast-info")),
                    "analyst-price-targets": request.build_absolute_uri(reverse("analyst-price-targets")),
                    "recommendations": request.build_absolute_uri(reverse("recommendations")),
                }
            }
        })
