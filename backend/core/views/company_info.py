from rest_framework.views import APIView
from rest_framework.response import Response
from core.models.company_info import CompanyInfo, RelatedCompany
from core.serializers.company_info import CompanySerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from core.utils.get_company_info import get_user_company
from django.db.models import Prefetch


class CompanyInfoView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            print(
                f"User: {user} ({user.pk}), Authenticated: {user.is_authenticated}")

            company = get_user_company(user)
            print(f"Company returned from get_user_company: {company}")

            if not company:
                print("Company not found, returning 404.")
                return Response({'error': 'No company found for this user.'}, status=404)

            print(f"Company PK: {getattr(company, 'pk', None)}")

            try:
                company_obj = CompanyInfo.objects.prefetch_related(
                    Prefetch(
                        'related_companies',
                        queryset=RelatedCompany.objects.filter(kind='competitor'),
                        to_attr='prefetched_competitors'
                    ),
                    'ceos'
                ).get(pk=company.pk)
                print(f"Fetched CompanyInfo: {company_obj}")
            except Exception as e:
                print(f"Exception fetching CompanyInfo with prefetch: {e}")
                return Response({'error': f'Error fetching CompanyInfo: {e}'}, status=500)

            try:
                serializer = CompanySerializer(company_obj)
                print("Serializer .data:", serializer.data)
            except Exception as e:
                print(f"Exception serializing company: {e}")
                return Response({'error': f'Error serializing company: {e}'}, status=500)

            return Response(serializer.data)

        except Exception as e:
            import traceback
            print("Final except block hit:")
            traceback.print_exc()
            return Response({'error': str(e)}, status=500)
