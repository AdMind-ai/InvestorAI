from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework import status, viewsets, generics
from rest_framework.decorators import action

from .serializers import (CustomUserSerializer,
                          CustomTokenObtainPairSerializer, RegisterSerializer)

User = get_user_model()


class IsCompanyAdmin(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and getattr(request.user, "is_company_admin", False)


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = CustomUserSerializer
    queryset = User.objects.all()

    def get_queryset(self):
        user = self.request.user
        return User.objects.filter(company=user.company)

    def get_permissions(self):
        if self.action in ['create', 'destroy', 'update']:
            return [IsCompanyAdmin()]
        return [IsAuthenticated()]

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path="set_password")
    def set_password(self, request, pk=None):
        user = self.get_object()
        password = request.data.get('password')
        if not password:
            return Response({'error': 'Password obrigatória.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(password)
        user.save()
        return Response({'status': 'Senha atualizada com sucesso'})


class RegisterView(generics.CreateAPIView):
    """
    Endpoint to register new users.
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
