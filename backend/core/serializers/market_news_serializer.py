from rest_framework import serializers


class MarketNewsRequestSerializer(serializers.Serializer):
    company = serializers.CharField(max_length=255)
    type = serializers.ChoiceField(
        choices=[('competitors', 'Competitors'), ('sector', 'Sector')])

    def validate(self, attrs):
        company = attrs.get('company')
        news_type = attrs.get('type')

        if not company:
            raise serializers.ValidationError("Company name is required.")

        if news_type not in ['competitors', 'sector']:
            raise serializers.ValidationError(
                "Type must be 'competitors' or 'sector'.")

        return attrs
