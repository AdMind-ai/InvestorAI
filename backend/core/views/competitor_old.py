from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.models.company_info import CompanyInfo, CompetitorInfo
from core.models.competitor_model import CompetitorSearch, Competitor
from django.shortcuts import get_object_or_404


from datetime import date
from django.db import transaction

# Old View for Competitor - dont use this anymore


class CompetitorView(APIView):
    def post(self, request):
        try:
            company_name = request.data.get('company')
            name = request.data.get('name')
            stock_symbol = request.data.get('stock_symbol', '')
            sector = request.data.get('sector', '')
            website = request.data.get('website', '')
            # Use "description", "logo", "sectors" se quiser para o Competitor!

            # Você pode pegar pelo short_name ou long_name conforme preferir
            if not company_name or not name:
                return Response({"error": "Company and name are required."}, status=status.HTTP_400_BAD_REQUEST)

            company_obj = get_object_or_404(
                CompanyInfo, long_name=company_name)
            company_short = company_obj.short_name or company_name

            # CRIA TUDO DENTRO DE UMA TRANSAÇÃO
            with transaction.atomic():
                # 1. Cria CompetitorInfo
                comp_info = CompetitorInfo.objects.create(
                    company=company_obj,
                    name=name,
                    stock_symbol=stock_symbol,
                    sector=sector,
                    website=website
                )

                # 2. Busca ou cria um CompetitorSearch do mesmo nome de empresa e data HOJE
                search, created = CompetitorSearch.objects.get_or_create(
                    company_name=company_short,
                    search_date=date.today(),
                    defaults={"sector": sector or "Unknown"}
                )

                # 3. Cria Competitor para essa search
                Competitor.objects.create(
                    search=search,
                    competitor=name,
                    logo=request.data.get("logo", ""),
                    sectors=[sector] if isinstance(
                        sector, str) else sector,
                    description=request.data.get(
                        "description", "Added by User."),
                    website=website,
                )

            return Response("Created competitor with success (both models)", status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request):
        """
        Remove um competitor (por nome e empresa) de TODOS OS MODELOS relacionados
        """
        name = request.data.get('name')
        company = request.data.get('company')

        if not name or not company:
            return Response(
                {"error": "Competitor name and company are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Pega a empresa
            company_obj = get_object_or_404(CompanyInfo, long_name=company)

            # Apaga TODOS os CompetitorInfo daquele nome e empresa.
            info_deleted, _ = CompetitorInfo.objects.filter(
                company=company_obj, name__iexact=name
            ).delete()

            # Apaga TODOS os Competitors daquele nome em searches da mesma empresa
            competitor_deleted, _ = Competitor.objects.filter(
                competitor__iexact=name,
                search__company_name__iexact=company_obj.short_name
            ).delete()

            # (Opcional) Remove CompetitorSearch que ficaram "vazios"
            # searches_vazias = CompetitorSearch.objects.filter(company_name__iexact=company_obj.short_name)\
            #     .annotate(num_competitors=models.Count("competitors"))\
            #     .filter(num_competitors=0)
            # deletadas = searches_vazias.count()
            # searches_vazias.delete()

            return Response(
                {
                    "deleted_from_CompetitorInfo": info_deleted,
                    "deleted_from_Competitor": competitor_deleted,
                    # "CompetitorSearchs_empty_deleted": deletadas,
                    "message": f"Competitor '{name}' removed from all models for company '{company_obj.long_name}'"
                },
                status=status.HTTP_200_OK
            )

        except CompanyInfo.DoesNotExist:
            return Response(
                {"error": "Company not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"Unexpected error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
