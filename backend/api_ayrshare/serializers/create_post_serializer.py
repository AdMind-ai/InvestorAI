from rest_framework import serializers


class CreatePostSerializer(serializers.Serializer):
    post = serializers.CharField()
    platform = serializers.CharField()
    date = serializers.DateTimeField(allow_null=False, format='iso-8601')
    schedule = serializers.DateTimeField(allow_null=False, format='iso-8601')
