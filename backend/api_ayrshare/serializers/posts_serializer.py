from rest_framework import serializers
from api_ayrshare.models import Posts
from django.conf import settings

class PostsSerializer(serializers.ModelSerializer):

    class Meta:
        model = Posts
        fields = '__all__'