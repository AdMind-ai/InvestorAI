from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from core.models.company_info import CompanyInfo
from core.models.market_article_model import MarketNewsSetup
from core.serializers.market_news_setup_serializer import MarketingNewsSetupSerializer
from core.utils.get_company_info import get_user_company


class MarketNewsSetupView(APIView):
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
        Mark the company as configured (or update the status).
        """
        try:
            company = get_user_company(request.user)
        except CompanyInfo.DoesNotExist:
            return Response({"detail": "Company not found."}, status=404)

        setup, _ = MarketNewsSetup.objects.update_or_create(
            company=company,
            defaults={"is_configured": True}
        )

        serializer = MarketingNewsSetupSerializer(setup)
        return Response(serializer.data, status=status.HTTP_200_OK)
