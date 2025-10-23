from rest_framework import serializers
from core.models.linkedin_scheduled_post import LinkedinScheduledPost


class LinkedinScheduledPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = LinkedinScheduledPost
        fields = [
            "id",
            "company",
            "created_by",
            "text",
            "image_base64",
            "scheduled_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "created_by"]
