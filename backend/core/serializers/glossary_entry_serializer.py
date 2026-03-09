from rest_framework import serializers

from core.models.glossary_entry import GlossaryEntry


class GlossaryEntrySerializer(serializers.ModelSerializer):
    targetLangs = serializers.ListField(
        child=serializers.CharField(),
        source="target_langs",
        required=False,
        allow_empty=True,
    )

    class Meta:
        model = GlossaryEntry
        fields = ["id", "original", "translation", "targetLangs"]

    def validate_original(self, value: str) -> str:
        cleaned = (value or "").strip()
        if not cleaned:
            raise serializers.ValidationError("'original' is required.")
        return cleaned

    def validate_translation(self, value: str) -> str:
        return (value or "").strip()


class GlossaryEntryBulkUpsertSerializer(serializers.Serializer):
    entries = GlossaryEntrySerializer(many=True)


class GlossaryEntryCreateSerializer(GlossaryEntrySerializer):
    pass
