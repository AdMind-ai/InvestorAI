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
            "main": request.build_absolute_uri(reverse("api-root")),
            "users": {
                "token_obtain": request.build_absolute_uri(reverse("token_obtain_pair")),
                "token_refresh": request.build_absolute_uri(reverse("token_refresh")),
                "user_register": request.build_absolute_uri(reverse("register_user")),
                "users_list": request.build_absolute_uri(reverse("users-list")),
                "user_detail_current": request.build_absolute_uri(reverse("users-detail", kwargs={'pk': user_id})),
            },
            "core": {
                "perplexity_deep-search": request.build_absolute_uri(reverse("deep-search")),
                "perplexity_esg-news": request.build_absolute_uri(reverse("perplexity-esg-news")),
                "perplexity_ceo-news": request.build_absolute_uri(reverse("perplexity-ceo-news")),
                "deepl_file": request.build_absolute_uri(reverse("translate-file")),
                "deepl_text": request.build_absolute_uri(reverse("translate-text")),
                "openai_audio-transcription": request.build_absolute_uri(reverse("audio-transcription")),
                "openai_esg-news": request.build_absolute_uri(reverse("openai-esg-news")),
                "openai_ceo-news": request.build_absolute_uri(reverse("openai-ceo-news")),
                "elevenlabs_text-to-speech": request.build_absolute_uri(reverse("text-to-speech")),
                "esg-articles": request.build_absolute_uri(reverse("esgarticle-list")),
                "ceo-articles": request.build_absolute_uri(reverse("ceoarticle-list")),
            }
        })
