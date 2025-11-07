from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from core.models.company_info import CompanyInfo
from core.serializers.company_info.company_sector_update_serializer import CompanySectorUpdateSerializer
from core.utils.get_company_info import get_user_company


class CompanyInfoSectorView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Retorna as informações atuais de setor da empresa do usuário autenticado.
        """
        try:
            user = request.user
            company = get_user_company(user)

            if not company:
                return Response({'error': 'No company found for this user.'}, status=status.HTTP_404_NOT_FOUND)

            company_obj = CompanyInfo.objects.get(pk=company.pk)
            serializer = CompanySectorUpdateSerializer(company_obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except CompanyInfo.DoesNotExist:
            return Response({'error': 'Company not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def patch(self, request):
        """
        Atualiza apenas as informações de setor de uma empresa associada ao usuário autenticado.
        """
        try:
            user = request.user
            company = get_user_company(user)

            if not company:
                return Response({'error': 'No company found for this user.'}, status=status.HTTP_404_NOT_FOUND)

            company_obj = CompanyInfo.objects.get(pk=company.pk)
            data = request.data

            # Atualiza campos relevantes
            if 'description' in data:
                company_obj.description = data['description']
            if 'sector_keywords' in data:
                company_obj.sector_keywords = data['sector_keywords']
            if 'sector_websites' in data:
                company_obj.sector_websites = data['sector_websites']

            company_obj.save()

            serializer = CompanySectorUpdateSerializer(company_obj)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except CompanyInfo.DoesNotExist:
            return Response({'error': 'Company not found.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
