from rest_framework.views import APIView
from rest_framework.response import Response
from core.models.company_info.company_route_restriction import CompanyRouteRestriction
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from core.utils.get_company_info import get_user_company


class CompanyRouteRestrictionView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        company = get_user_company(user)

        if not company:
            return Response({"restricted_routes": ["all"]}, status=200)

        restriction, created = CompanyRouteRestriction.objects.get_or_create(
            company=company)

        if created:
            # Se foi criado agora, retorna all independente do campo no db
            return Response({"restricted_routes": ["all"]}, status=200)
        else:
            # Se já existia, retorna as rotas salvas
            return Response({"restricted_routes": restriction.restricted_routes or []}, status=200)
