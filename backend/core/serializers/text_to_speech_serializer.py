from rest_framework import serializers

LANGUAGE_CHOICES = [
    ('en', 'English'),
    ('it', 'Italian'),
    ('fr', 'French'),
    ('de', 'German'),
    ('pt', 'Portuguese'),
    ('el', 'Greek'),
    ('es', 'Spanish'),
]

VOICE_CHOICES = [
    ('sRveAWnt4yJqxspzpLhv', 'Voice 1'),
    ('iYm4Mj4mf3x5liAlkFQ0', 'Voice 2'),
]


class ElevenlabsTextToSpeechSerializer(serializers.Serializer):
    send = serializers.CharField()
    language = serializers.ChoiceField(choices=LANGUAGE_CHOICES)
    id_voice = serializers.ChoiceField(choices=VOICE_CHOICES)
    stability = serializers.FloatField(
        required=False, min_value=0.0, max_value=1.0, default=0.5)
    similarity_boost = serializers.FloatField(
        required=False, min_value=0.0, max_value=1.0, default=0.0)
    style = serializers.FloatField(
        required=False, min_value=0.0, max_value=1.0, default=0.6)
    use_speaker_boost = serializers.BooleanField(required=False, default=False)

    def validate_language(self, value):
        if value not in ['en', 'it', 'fr', 'de', 'pt', 'el', 'es']:
            raise serializers.ValidationError(
                'Invalid language. Allowed language are "el"[Greek], "en"[English], "es"[Spanish],"it"[Italian], "fr"[French], "de"[German] and "pt"[Portuguese].'
            )
        return value
