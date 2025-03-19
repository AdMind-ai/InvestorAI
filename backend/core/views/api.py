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
                "core_endpoint": request.build_absolute_uri(reverse("hello")),
                "perplexity": request.build_absolute_uri(reverse("perplexity")),
                "deepl_file": request.build_absolute_uri(reverse("translatefile")),
                "deepl_text": request.build_absolute_uri(reverse("translatetext")),
                # "core_list": request.build_absolute_uri(reverse("core-list")),
            }
        })
