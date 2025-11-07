from typing import Dict, Any

from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction

from core.models.market_news_alert_preference import MarketNewsAlertPreference
from core.models.company_info.company_info import CompanyInfo
from core.utils.get_company_info import get_user_company


class MarketNewsAlertPreferenceView(APIView):
    """
    Persist user's market-intelligence alert preferences (email + per-category settings)
    for the current company.

    POST body example:
    {
        "email": "user@example.com",
        "preferences": {
            "sector": {"enabled": true, "relevance": "high"},
            "competitor": {"enabled": false, "relevance": "medium"},
            "client": {"enabled": true, "relevance": "low"},
            "fornitori": {"enabled": true, "relevance": "high"}
        }
    }

    GET params:
    - email (optional): when provided, returns the saved preferences for that email.
    """

    permission_classes = [permissions.IsAuthenticated]

    # Map frontend categories to model choices
    CATEGORY_MAP = {
        "sector": "sector",
        "competitor": "competitors",
        "client": "clients",
        "fornitori": "fornitori",
    }

    VALID_RELEVANCE = {"high", "medium", "low"}

    def get(self, request):
        try:
            company: CompanyInfo | None = get_user_company(request.user)
        except CompanyInfo.DoesNotExist:
            company = None

        if not company:
            return Response({"detail": "Company not found."}, status=status.HTTP_404_NOT_FOUND)

        email = request.query_params.get("email")
        qs = MarketNewsAlertPreference.objects.filter(company=company)
        if email:
            qs = qs.filter(email=email)

        # Build a normalized response grouped by email
        data: Dict[str, Dict[str, Any]] = {}
        for pref in qs:
            key = pref.email
            if key not in data:
                data[key] = {
                    "email": pref.email,
                    "preferences": {
                        "sector": {"enabled": False, "relevance": "high"},
                        "competitor": {"enabled": False, "relevance": "high"},
                        "client": {"enabled": False, "relevance": "high"},
                        "fornitori": {"enabled": False, "relevance": "high"},
                    },
                }

            # reverse map model category back to frontend keys
            if pref.category == "sector":
                cat_key = "sector"
            elif pref.category == "competitors":
                cat_key = "competitor"
            elif pref.category == "clients":
                cat_key = "client"
            else:
                cat_key = "fornitori"

            data[key]["preferences"][cat_key] = {
                "enabled": pref.enabled,
                "relevance": pref.relevance,
            }

        if email:
            # Return single object (or defaults if none)
            result = data.get(email) or {
                "email": email,
                "preferences": {
                    "sector": {"enabled": True, "relevance": "high"},
                    "competitor": {"enabled": True, "relevance": "high"},
                    "client": {"enabled": True, "relevance": "high"},
                    "fornitori": {"enabled": True, "relevance": "high"},
                },
            }
            return Response(result, status=status.HTTP_200_OK)

        # Return a list grouped by email
        return Response(list(data.values()), status=status.HTTP_200_OK)

    def post(self, request):
        body: Dict[str, Any] = request.data or {}
        email: str | None = body.get("email")
        preferences: Dict[str, Dict[str, Any]] | None = body.get("preferences")

        if not email:
            return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            validate_email(email)
        except ValidationError:
            return Response({"detail": "Invalid email format."}, status=status.HTTP_400_BAD_REQUEST)

        if not isinstance(preferences, dict):
            return Response({"detail": "Preferences object is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            company: CompanyInfo | None = get_user_company(request.user)
        except CompanyInfo.DoesNotExist:
            company = None

        if not company:
            return Response({"detail": "Company not found."}, status=status.HTTP_404_NOT_FOUND)

        # Normalize incoming preferences and upsert rows
        saved: Dict[str, Dict[str, Any]] = {}
        for frontend_key, model_key in self.CATEGORY_MAP.items():
            pref_in = preferences.get(frontend_key, {}) or {}
            enabled = bool(pref_in.get("enabled", True))
            relevance = str(pref_in.get("relevance", "high")).lower()
            if relevance not in self.VALID_RELEVANCE:
                relevance = "high"

            # Evita duplicados sem alterar o schema:
            # Se existir um ou mais registros (company,category), atualiza TODOS para manter consistência.
            # Caso não exista, cria um novo.
            with transaction.atomic():
                existing_qs = (
                    MarketNewsAlertPreference.objects.select_for_update()
                    .filter(company=company, category=model_key)
                )
                if existing_qs.exists():
                    # Atualiza todos os duplicados para refletir os novos valores
                    existing_qs.update(email=email, enabled=enabled, relevance=relevance)
                    # Usa o mais recente como referência para resposta
                    obj = existing_qs.order_by('-created_at', '-id').first()
                else:
                    obj = MarketNewsAlertPreference.objects.create(
                        company=company,
                        email=email,
                        category=model_key,
                        enabled=enabled,
                        relevance=relevance,
                    )

            saved[frontend_key] = {"enabled": obj.enabled, "relevance": obj.relevance}

        return Response(
            {"email": email, "preferences": saved},
            status=status.HTTP_200_OK,
        )
