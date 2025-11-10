from rest_framework import serializers
from core.models.esg_monthly_report_model import ESGMonthlyReport


class ESGMonthlyReportSummarySerializer(serializers.ModelSerializer):
    report_period = serializers.SerializerMethodField()

    class Meta:
        model = ESGMonthlyReport
        fields = ["id", "report_name", "report_period"]

    def get_report_period(self, obj):
        return obj.report_period.strftime("%Y-%m") if obj.report_period else None


class ESGMonthlyReportDetailSerializer(serializers.ModelSerializer):
    company = serializers.CharField(source="company.short_name", read_only=True)
    report_period = serializers.SerializerMethodField()

    class Meta:
        model = ESGMonthlyReport
        fields = [
            "id",
            "company",
            "report_name",
            "report_description",
            "report_period",
            "created_at",
            "updated_at",
        ]

    def get_report_period(self, obj):
        return obj.report_period.strftime("%Y-%m") if obj.report_period else None
