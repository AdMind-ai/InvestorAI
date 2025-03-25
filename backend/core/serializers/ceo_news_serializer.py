from rest_framework import serializers


class CEONewsSerializer(serializers.Serializer):
    personality = serializers.ChoiceField(choices=[
        "Mario Rossi",
        "Elvira Giacomelli",
        "Luigi Farris",
    ])
