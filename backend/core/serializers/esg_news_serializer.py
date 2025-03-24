from rest_framework import serializers


class ESGNewsSerializer(serializers.Serializer):
    topic = serializers.ChoiceField(choices=[
        "Evoluzione del contesto normativo",
        "News reati informativi",
        "Responsabilità amministratori",
        "Rischi reputazionali"
    ])
