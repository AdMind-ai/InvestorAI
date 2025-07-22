from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.models.company_info import CompanyInfo
from core.models.company_info import CompetitorInfo
from django.shortcuts import get_object_or_404

class CompetitorView(APIView):
    def post(self, request): 
        try:
            company = request.data.get('company')
            name = request.data.get('name')
            stock_symbol = request.data.get('stock_symbol', '')
            sector = request.data.get('sector', '')
            website = request.data.get('website', '')

            if not company or not name:
                return Response({"error": "Company and name are required."}, status=status.HTTP_400_BAD_REQUEST)

            try:
                company = get_object_or_404(CompanyInfo, long_name=company)
            except CompanyInfo.DoesNotExist:
                return Response(
                    {"error": "Company not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

            competitor = CompetitorInfo.objects.create(
                company=company,
                name=name,
                stock_symbol=stock_symbol,
                sector=sector,
                website=website
            )

            return Response("Created competitor with success", status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def delete(self, request):
        name = request.data.get('name')
    
        try:
            competitor = get_object_or_404(CompetitorInfo, name=name)
            competitor.delete()

            return Response({"message": "Competitor deleted."}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Unexpected error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )