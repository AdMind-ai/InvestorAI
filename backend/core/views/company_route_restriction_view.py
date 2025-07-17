from rest_framework.views import APIView
from rest_framework.response import Response
from core.models.company_info.company_route_restriction import CompanyRouteRestriction
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication


class CompanyRouteRestrictionView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        company = getattr(user, "company", None)

        if not company:
            return Response({"restricted_routes": ["all"]}, status=200)

        restriction, _ = CompanyRouteRestriction.objects.get_or_create(
            company=company)
        return Response({"restricted_routes": restriction.restricted_routes})
