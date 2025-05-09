from django.conf import settings
from ayrshare import SocialPost
from api_ayrshare.serializers.profiles_serializer import ProfilesSerializer
from api_ayrshare.models import Profiles
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from datetime import datetime


class ProfilesListView(generics.ListAPIView):
    queryset = Profiles.objects.all()
    serializer_class = ProfilesSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request):
        queryset = Profiles.objects.filter(user=request.user)
        serializer = ProfilesSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        profiles = Profiles.objects.filter(user=request.user)
        profiles_count = profiles.count()
        # checks if the user already has 1 profile
        if profiles_count >= 1:
            serializer = ProfilesSerializer(profiles, many=True)
            return Response(serializer.data)
        name = f'ADAPT-AI: {datetime.now().strftime("%Y%m%d%H%M%S%f")} - {request.user.email}'
        social = SocialPost(settings.AYRSHARE_TOKEN)

        json = social.createProfile(
            {
                'title': name,
            }
        )

        if 'status' in json.keys() and json['status'] == 'success':
            profileKey = json['profileKey']
            ref_id = json['refId']
            profile = Profiles()
            profile.name = name
            profile.user = request.user
            profile.key = profileKey
            profile.ref_id = ref_id
            profile.save()

            serializer = ProfilesSerializer(profile)
            return Response(serializer.data)
        elif (
            'status' in json.keys()
            and json['status'] == 'error'
            and 'message' in json.keys()
        ):
            if 'Profile title already exists.' in json['message']:
                return Response(
                    {
                        'code': 'error',
                        'detail': 'Invalid name, profile title already exists',
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            else:
                return Response(
                    {
                        'code': 'error',
                        'detail': json['message'],
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
