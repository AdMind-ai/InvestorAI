import requests
from ayrshare import SocialPost
from django.conf import settings
from django.http import Http404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from api_ayrshare.models import Profiles


class ProfileKeyView(APIView):
    permission_classes = (IsAuthenticated,)
    
    def get(self, request, pk, format=None):
        try:
            key_data = settings.AYRSHARE_KEY.replace("\\n", "\n")
            profile = Profiles.objects.get(user=request.user, id=pk)
            social = SocialPost(settings.AYRSHARE_TOKEN)
            generateJWTResponse = social.generateJWT(
                {
                    'domain': 'admind',
                    'privateKey': key_data,
                    'profileKey': profile.key,
                    'logout': True,
                }
            )
            result = generateJWTResponse

            if result.get('status') == 'success':
                headers = {
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {settings.AYRSHARE_TOKEN}',
                }
                r = requests.get(
                    f'https://app.ayrshare.com/api/profiles?profileKey={profile.key}',
                    headers=headers,
                )
                social = []
                if (
                    r.json()
                    and r.json().get('profiles', None)
                    and len(r.json().get('profiles')) > 0
                ):
                    social = (
                        r.json().get('profiles')[0].get('activeSocialAccounts')
                    )
                return Response(
                    {'url': result.get('url'), 'social': social},
                    status=status.HTTP_200_OK,
                )
        except Profiles.DoesNotExist:
            raise Http404

        return Response(
            {'link', 'does not create link.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
