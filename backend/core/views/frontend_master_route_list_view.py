from rest_framework.views import APIView
# ou IsAuthenticated, você escolhe
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from core.models.frontend_master_route_list import MasterRouteList


class MasterRouteListUpdateView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        routes = request.data.get('routes', [])
        if not isinstance(routes, list):
            return Response({"error": "Routes must be a list."}, status=400)
        obj, _ = MasterRouteList.objects.get_or_create(id=1)
        obj.routes = routes
        obj.save()
        return Response({"success": True, "routes": routes})
