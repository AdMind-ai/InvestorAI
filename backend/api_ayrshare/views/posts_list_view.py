import requests
import base64
import mimetypes

from calendar import monthrange
from datetime import datetime
from django.conf import settings
from django.http import Http404
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication

from api_ayrshare.models import Posts, Profiles, ImageUpload
from api_ayrshare.pagination import PaginationHandlerMixin
from api_ayrshare.serializers.create_post_serializer import CreatePostSerializer
from api_ayrshare.serializers.posts_serializer import PostsSerializer

ayrshare_url = 'https://app.ayrshare.com/api'

class BasicPagination(PageNumberPagination):
    page_size = 3
    max_page_size = 100


class PostsListView(PaginationHandlerMixin, APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    pagination_class = BasicPagination

    def _create_header(self, profile= None):
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
        
    def _check_scheduled_posts(self, profile):
        today = timezone.now()
        schedule_posts = Posts.objects.filter(
            profile=profile, status='scheduled', post_date__lte=today
        )
        if len(schedule_posts) > 0:
            headers = self._create_header(profile)
            for schedule_post in schedule_posts:
                r = requests.get(
                    f'{ayrshare_url}/post/{schedule_post.ayrshare_id}',
                    headers=headers,
                )
                ayrshare_json = r.json()
                erros = []
                if 'postIds' in ayrshare_json.keys():
                    posts_platforms = ayrshare_json.get('postIds', [])
                    for posts_platform in posts_platforms:
                        schedule_post.platform_post_id = posts_platform.get(
                            'id'
                        )
                        schedule_post.url = posts_platform.get('postUrl')
                        schedule_post.status = posts_platform.get('status')

                    requests_posts_errors = ayrshare_json.get('errors', [])
                    for posts_error in requests_posts_errors:
                        schedule_post.platform_post_id = posts_error.get('id')
                        schedule_post.url = posts_error.get('postUrl')
                        schedule_post.status = posts_error.get('status')
                        schedule_post.message_error = posts_error.get(
                            'message', ''
                        )
                        

                        erros.append(
                            f'{schedule_post.platform}: {schedule_post.message_error}'
                        )

                    schedule_post.save()
                    '''
                    images = ImageUpload.objects.filter(post=post)
                    for image in images:
                        image.delete()
                    schedule_post.delete()
                    '''                

    def _create_post(self, request, serializer, profile):
        text = serializer.validated_data.get('post')
        platform = serializer.validated_data.get('platform')
        date = serializer.validated_data.get('date')
        schedule = serializer.validated_data.get('schedule')
        file = request.data.get('file')

        payload = {'post': text, 'platforms': [platform], 'profileKey': profile.key}
        if file:
            payload['mediaUrls'] = []
            image = ImageUpload()
            image.user = request.user
            image.save_image_from_file(file)
            image.save()
            image_url = f'{settings.URL_HOST}{image.image_url}'
            payload['mediaUrls'].append(image_url)

        if (schedule != date and schedule > date):  
            payload['scheduleDate'] = schedule.isoformat()

        headers = self._create_header()
        r = requests.post(f'{ayrshare_url}/post', json=payload, headers=headers)
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
            post.text = text
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
                    post.platform_post_id  = posts_platform.get('id', '0000')
                    post.url = posts_platform.get('postUrl', '-')
                    post.message_error = posts_platform.get('message', '')
                    post.status = posts_platform.get('status')

            ayrshare_post_errors = ayrshare_post.get('errors', [])
            for ayrshare_post_error in ayrshare_post_errors:
                post.platform_post_id  = ayrshare_post_error.get('id', '0000')
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
                
    def get(self, request, id, format=None):
        profile = self._get_profile(request.user, id)
        self._check_scheduled_posts(profile)

        status = request.GET.get('status')
        month = request.GET.get('month')
        year = request.GET.get('year')

        queryset = Posts.objects.select_related(
            'profile'
        )
        if status == 'scheduled':
            posts = queryset.filter(profile=profile, status='scheduled')
        elif status == 'published':
            posts = queryset.filter(profile=profile).exclude(
                status='scheduled'
            )
        else:
            posts = queryset.filter(profile=profile)

        if month and year:
            year_start = int(year)
            year_end = int(year)

            if int(month) == 1:
                month_start = 12
                year_start = year_start - 1
            else:
                month_start = int(month) - 1

            if int(month) == 12:
                month_end = 1
                year_end = year_start + 1
            else:
                month_end = int(month) + 1

            date_start = datetime.strptime(
                f'{1:02}/{month_start:02}/{year_start:04} 00:00:00',
                '%d/%m/%Y %H:%M:%S',
            )
            date_end = datetime.strptime(
                f'{1:02}/{month_end:02}/{year_end:04} 00:00:00',
                '%d/%m/%Y %H:%M:%S',
            )
            date_end = date_end.replace(
                day=monthrange(date_end.year, date_end.month)[1]
            )
            date_start = timezone.make_aware(date_start)
            date_end = timezone.make_aware(date_end)
            posts = posts.filter(post_date__range=(date_start, date_end))

        posts = posts.order_by('-post_date')

        if status == 'all':
            serializer = PostsSerializer(posts, many=True)
        else:
            page = self.paginate_queryset(posts)
            if page is not None:
                serializer = self.get_paginated_response(
                    PostsSerializer(page, many=True).data
                )
            else:
                serializer = PostsSerializer(posts, many=True)

        return Response(serializer.data)
    
    def post(self, request, id, format=None):
        serializer = CreatePostSerializer(data=request.data)

        if serializer.is_valid():

            profile = self._get_profile(request.user, id)
            try:
                return self._create_post(request, serializer, profile)
            except Exception as e:
                return Response(
                    {'detail': str(e), 'code': str(e)},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    