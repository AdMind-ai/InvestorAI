import requests
from django.conf import settings
from django.http import Http404
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from api_ayrshare.models import Posts, Profiles, ImageUpload
from api_ayrshare.serializers.create_post_serializer import CreatePostSerializer
from api_ayrshare.serializers.posts_serializer import PostsSerializer

ayrshare_url = 'https://app.ayrshare.com/api'


class PostsDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def _create_header(self, profile=None):
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {settings.AYRSHARE_TOKEN}',
        }
        if profile:
            headers['Profile-Key'] = profile.key
        return headers

    def _get_profile(self, user, id):
        try:
            profile = Profiles.objects.get(user=user, id=id)
            return profile
        except Profiles.DoesNotExist:
            raise Http404

    def _create_post(self, request, serializer, profile):
        post = serializer.validated_data.get('post')
        platform = serializer.validated_data.get('platform')
        date = serializer.validated_data.get('date')
        schedule = serializer.validated_data.get('schedule')
        file = request.data.get('file')

        payload = {'post': post, 'platforms': [
            platform], 'profileKey': profile.key}
        if file:
            payload['mediaUrls'] = []
            image = ImageUpload()
            image.user = request.user
            image.save_image_from_file(file)
            image.save()
            image_url = image.get_blob_sas_url(expires_in_minutes=10)
            payload['mediaUrls'].append(image_url)

        if (schedule != date and schedule > date):
            payload['scheduleDate'] = schedule.isoformat()

        headers = self._create_header()
        r = requests.post(f'{ayrshare_url}/post',
                          json=payload, headers=headers)

        ayrshare_json = r.json()
        ayrshare_erros = []
        ayrshare_posts = ayrshare_json.get('posts')
        for ayrshare_post in ayrshare_posts:
            post = Posts()
            post.profile = profile
            post.platform = platform
            post.ayrshare_id = ayrshare_post.get('id', '0000')
            post.ref_id = ayrshare_post.get('refId', '0000')
            post.status = ayrshare_post.get('status')
            post.text = ayrshare_post.get('post', '-')
            post.send_local_date = date
            post.message_error = ayrshare_post.get('message', None)
            post.post_date = schedule if schedule != date and schedule > date else date
            if (
                'mediaUrls' in payload.keys()
                and len(payload['mediaUrls']) > 0
                and '' not in payload['mediaUrls']
            ):
                post.image = payload['mediaUrls'][0]

            if post.status == 'scheduled':
                post.platform_post_id = '0000'
                post.url = '-'
            else:
                ayrshare_post_platforms = ayrshare_post.get('postIds', [])
                for posts_platform in ayrshare_post_platforms:
                    post.platform_post_id = posts_platform.get('id', '0000')
                    post.url = posts_platform.get('postUrl', '-')
                    post.message_error = posts_platform.get('message', '')
                    post.status = posts_platform.get('status')

            ayrshare_post_errors = ayrshare_post.get('errors', [])
            for ayrshare_post_error in ayrshare_post_errors:
                post.platform_post_id = ayrshare_post_error.get('id', '0000')
                post.url = ayrshare_post_error.get('postUrl', '-')
                post.message_error = ayrshare_post_error.get('message', '')
                post.status = ayrshare_post_error.get('status')
                ayrshare_erros.append(
                    f'{post.platform}: {post.message_error}'
                )

            post.save()
            if file:
                image.post = post
                image.save()

        if len(ayrshare_erros) > 0:
            return Response(
                {'data': 'published with errors', 'error': ayrshare_erros},
                status=status.HTTP_201_CREATED,
            )
        else:
            return Response(
                {'data': 'all posts published'}, status=status.HTTP_201_CREATED
            )

    def _delete_post(self, user, post_id, profile):
        try:
            post = Posts.objects.get(id=post_id, profile=profile)
            headers = self._create_header()
            payload = {
                'id': post.ayrshare_id,
                'profileKey': post.profile.key,
            }

            r = requests.delete(
                f'{ayrshare_url}/post',
                json=payload,
                headers=headers,
            )
            ayrshare_json = r.json()
            ayrshare_status = ayrshare_json.get('status')
            if ayrshare_status == 'success':
                images = ImageUpload.objects.filter(post=post)
                for image in images:
                    image.delete()
                post.delete()
                return ayrshare_status
            else:
                return ayrshare_status

        except Posts.DoesNotExist:
            raise Http404

    def get(self, request, id_profile, id, format=None):
        profile = self._get_profile(request.user, id_profile)
        try:
            post = Posts.objects.get(id=id, profile=profile)
        except Posts.DoesNotExist:
            raise Http404

        serializer = PostsSerializer(post)
        return Response(serializer.data)

    def delete(self, request, id_profile, id, format=None):
        profile = self._get_profile(request.user, id_profile)
        deleted = self._delete_post(request.user, id, profile)
        if deleted == 'success':
            return Response(status=status.HTTP_204_NO_CONTENT)
        else:
            return Response(
                {'data': 'ayrshare error'},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def put(self, request, id_profile, id, format=None):
        profile = self._get_profile(request.user, id_profile)
        serializer = CreatePostSerializer(data=request.data)
        if serializer.is_valid():
            deleted = self._delete_post(request.user, id, profile)

            if deleted == 'success':
                return self._create_post(request, serializer, profile)
            else:
                return Response(
                    {'data': 'ayrshare error'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
