from rest_framework import status, permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from core.models.company_info import CompanyInfo
from core.models.market_article_model import MarketNewsSetup
from core.serializers.market_news_setup_serializer import MarketingNewsSetupSerializer
from core.utils.get_company_info import get_user_company
from core.utils.openai_client import client

class MarketNewsSetupView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Returns whether the logged-in company has already configured news search.
        """
        try:
            company = get_user_company(request.user)
        except CompanyInfo.DoesNotExist:
            return Response({"detail": "Company not found."}, status=404)

        setup = MarketNewsSetup.objects.filter(company=company).first()

        if not setup:
            return Response({"is_configured": False}, status=200)

        serializer = MarketingNewsSetupSerializer(setup)
        return Response(serializer.data, status=200)

    def post(self, request):
        """
        Mark the company setup status. By default sets is_configured=True, but
        accepts an optional payload to explicitly set the status:

        Body (optional): { "is_configured": true|false }
        """
        try:
            company = get_user_company(request.user)
        except CompanyInfo.DoesNotExist:
            return Response({"detail": "Company not found."}, status=404)

        # gerar 4 conversation_id da openai e guardar nos campos correspondentes
        conversation_id_mi01 = client.conversations.create()
        conversation_id_mi02 = client.conversations.create()
        conversation_id_mi03 = client.conversations.create()
        conversation_id_mi04 = client.conversations.create()

        # Default to True if not provided, allowing callers to set False on errors
        is_configured = request.data.get("is_configured", True) if isinstance(request.data, dict) else True

        setup, _ = MarketNewsSetup.objects.update_or_create(
            company=company,
            defaults={
                "is_configured": bool(is_configured),
                "conversation_id_mi01": conversation_id_mi01.id,
                "conversation_id_mi02": conversation_id_mi02.id,
                "conversation_id_mi03": conversation_id_mi03.id,
                "conversation_id_mi04": conversation_id_mi04.id,
                }
        )

        serializer = MarketingNewsSetupSerializer(setup)
        return Response(serializer.data, status=status.HTTP_200_OK)
