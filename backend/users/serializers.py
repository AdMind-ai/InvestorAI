from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from core.models.company_info.company_info import CompanyInfo

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        # Não pega company aqui, deixa para o viewset via perform_create
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
        return user


class CustomUserSerializer(serializers.ModelSerializer):
    company = serializers.StringRelatedField()
    createdAt = serializers.DateTimeField(source='date_joined', read_only=True)
    modifiedAt = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "company", "is_company_admin", "createdAt", "modifiedAt"
        ]


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Personaliza o token para incluir mais informações do usuário"""

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data.update({"username": user.username, "email": user.email})
        return data
