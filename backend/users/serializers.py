from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from core.models.company_info.company_info import CompanyInfo

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    company = serializers.PrimaryKeyRelatedField(
        queryset=CompanyInfo.objects.all(), required=False, allow_null=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password',
                  'first_name', 'last_name', 'company']

    def create(self, validated_data):
        company = validated_data.pop('company', None)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        if company:
            user.company = company
            user.save()
        return user


class CustomUserSerializer(serializers.ModelSerializer):
    company = serializers.StringRelatedField()

    class Meta:
        model = User
        fields = [
            "id", "username", "email", "first_name", "last_name", "company"
        ]


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Personaliza o token para incluir mais informações do usuário"""

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data.update({"username": user.username, "email": user.email})
        return data
