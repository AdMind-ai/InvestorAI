
from api_ayrshare.serializers.profiles_serializer import ProfilesSerializer
from api_ayrshare.models import Profiles
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

class ProfilesDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Profiles.objects.all()
    serializer_class = ProfilesSerializer
    permission_classes = [IsAuthenticated]