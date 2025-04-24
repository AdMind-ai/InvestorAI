from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.http import Http404

from api_ayrshare.models import Profiles
from administration_tools.delete_ayrshare_profile import delete_profile


class ProfileDeleteView(APIView):
    permission_classes = (IsAuthenticated,)

    def delete(self, request, pk=None, format=None):
        try:
            # To use PK in the URL, use: profile = Profiles.objects.get(user=request.user, id=pk)
            profile = Profiles.objects.get(user=request.user)
        except Profiles.DoesNotExist:
            raise Http404("Profile not found")

        deleted = delete_profile(profile)

        if deleted:
            return Response(
                {"detail": "Profile successfully deleted from Ayrshare and the database."},
                status=status.HTTP_204_NO_CONTENT,
            )
        else:
            return Response(
                {"detail": "Could not delete the profile from Ayrshare."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
