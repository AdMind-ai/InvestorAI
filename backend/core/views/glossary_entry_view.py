import logging
import os
from django.db import transaction
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models.company_info.company_info import CompanyInfo
from core.models.glossary_entry import GlossaryEntry
from core.serializers.glossary_entry_serializer import (
    GlossaryEntryBulkUpsertSerializer,
    GlossaryEntryCreateSerializer,
    GlossaryEntrySerializer,
)
from core.utils.get_company_info import get_user_company
from core.services.deepl_glossary_service import DeepLGlossaryService

logger = logging.getLogger(__name__)


class GlossaryEntryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    VALID_SCOPE = {"user", "company"}

    def _resolve_scope(self, request) -> str:
        raw_scope = (
            request.query_params.get("scope")
            or request.data.get("scope")
            or "company"
        )
        scope = str(raw_scope).lower().strip()
        return scope if scope in self.VALID_SCOPE else "company"

    def _get_company(self, request):
        try:
            return get_user_company(request.user)
        except CompanyInfo.DoesNotExist:
            return None

    def _get_scope_queryset(self, request, scope: str):
        company = self._get_company(request)
        if not company:
            return None, Response(
                {"detail": "Company not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        base_qs = GlossaryEntry.objects.filter(company=company)
        if scope == "user":
            base_qs = base_qs.filter(created_by=request.user)

        return base_qs.order_by("id"), None

    def get(self, request):
        scope = self._resolve_scope(request)
        queryset, error_response = self._get_scope_queryset(request, scope)
        if error_response:
            return error_response

        serializer = GlossaryEntrySerializer(queryset, many=True)
        return Response(
            {
                "scope": scope,
                "entries": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

    def post(self, request):
        scope = self._resolve_scope(request)
        _, error_response = self._get_scope_queryset(request, scope)
        if error_response:
            return error_response

        serializer = GlossaryEntryCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        company = self._get_company(request)
        entry = GlossaryEntry.objects.create(
            company=company,
            created_by=request.user,
            original=serializer.validated_data["original"],
            translation=serializer.validated_data.get("translation", ""),
            target_langs=serializer.validated_data.get("target_langs", []),
        )

        data = GlossaryEntrySerializer(entry).data
        return Response(data, status=status.HTTP_201_CREATED)

    def put(self, request):
        scope = self._resolve_scope(request)
        queryset, error_response = self._get_scope_queryset(request, scope)
        if error_response:
            return error_response

        bulk_serializer = GlossaryEntryBulkUpsertSerializer(data=request.data)
        bulk_serializer.is_valid(raise_exception=True)

        entries = bulk_serializer.validated_data.get("entries", [])
        company = self._get_company(request)

        with transaction.atomic():
            queryset.delete()
            to_create = [
                GlossaryEntry(
                    company=company,
                    created_by=request.user,
                    original=item["original"],
                    translation=item.get("translation", ""),
                    target_langs=item.get("target_langs", []),
                )
                for item in entries
                if item.get("original", "").strip()
            ]
            if to_create:
                GlossaryEntry.objects.bulk_create(to_create)

        # Sync with DeepL after saving locally
        refreshed_qs, _ = self._get_scope_queryset(request, scope)
        try:
            deepl_key = os.getenv('DEEPL_KEY')
            deepl_service = DeepLGlossaryService(deepl_key)
            
            # Create glossaries for all supported source languages
            all_source_langs = list(DeepLGlossaryService.LANGUAGE_MAP.values())
            
            sync_result = deepl_service.sync_glossary(
                entries=list(refreshed_qs),
                company_id=company.id,
                user_id=request.user.id,
                scope=scope,
                source_langs=all_source_langs
            )

            if sync_result is not None:
                logger.info(f"Successfully synced glossary to DeepL for {scope}")
            else:
                logger.warning(f"Glossary sync did not complete for {scope}")
        except Exception as e:
            logger.error(f"Failed to sync glossary to DeepL: {e}")
            # Continue even if DeepL sync fails - local glossary is saved
        
        response_serializer = GlossaryEntrySerializer(refreshed_qs, many=True)
        return Response(
            {
                "scope": scope,
                "entries": response_serializer.data,
            },
            status=status.HTTP_200_OK,
        )
