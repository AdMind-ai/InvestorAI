from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.models.feature_usage import FeatureUsage
from core.utils.get_company_info import get_user_company
from core.serializers.feature_usage_serializer import FeatureUsageSerializer


class FeatureUsageIncrementView(APIView):
    """Endpoint to increment usage for a specific feature.

    POST payload: { "module": "earnings", "feature": "traduttore" }
    """

    def post(self, request, *args, **kwargs):
        module = request.data.get('module', FeatureUsage.MODULE_EARNINGS)
        feature = request.data.get('feature')
        user = request.user
        company = get_user_company(user)
        check_only = bool(request.data.get('check_only', False))

        if feature not in dict(FeatureUsage.FEATURE_CHOICES):
            return Response({"detail": "Invalid feature."}, status=status.HTTP_400_BAD_REQUEST)

        if not company:
            return Response({"detail": "company is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate company
        from core.models.company_info.company_info import CompanyInfo
        company = CompanyInfo.objects.filter(pk=company.id).first()
        if not company:
            return Response({"detail": "company not found."}, status=status.HTTP_400_BAD_REQUEST)
        # If check_only, don't create or increment — only report availability
        if check_only:
            obj = FeatureUsage.objects.filter(module=module, feature=feature, company=company).first()
            # default max limit for earnings if no object exists
            default_max = 0 if module == FeatureUsage.MODULE_EARNINGS else None
            if obj:
                if obj.max_limit is not None and obj.count >= obj.max_limit:
                    return Response({"allowed": False, "count": obj.count, "max_limit": obj.max_limit}, status=status.HTTP_200_OK)
                return Response({"allowed": True, "count": obj.count, "max_limit": obj.max_limit}, status=status.HTTP_200_OK)

            # no object exists -> use default max for earnings
            return Response({"allowed": True, "count": 0, "max_limit": default_max}, status=status.HTTP_200_OK)

        try:
            obj = FeatureUsage.increment(feature=feature, company=company, module=module)
        except ValueError as e:
            if str(e) == 'limit_reached':
                return Response({"detail": "usage limit reached"}, status=status.HTTP_403_FORBIDDEN)
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        serializer = FeatureUsageSerializer(obj)
        return Response(serializer.data, status=status.HTTP_200_OK)
