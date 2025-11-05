from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from pydantic import BaseModel, ValidationError
from typing import List
import os
from openai import OpenAI
from core.utils.get_company_info import get_user_company
from core.models.company_info import RelatedCompany


class RelatedCompanyInfo(BaseModel):
    company: str
    logo: str
    sectors: List[str]
    description: str
    website: str
    stock_symbol: str


class RelatedCompanyInfoList(BaseModel):
    date: str
    competitors: List[RelatedCompanyInfo]


client = OpenAI(api_key=os.getenv("OPENAI_KEY"))


class OpenAICompetitorSearchView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request, *args, **kwargs):
        """
        Lista empresas relacionadas. 
        Se for fornecido 'kind' na query, retorna apenas empresas desse tipo.
        """
        company = get_user_company(request.user)
        if not company:
            return Response({"error": "Company not found for this user."}, status=404)

        kind = request.query_params.get("kind")  # ex: 'competitor', 'client', 'fornitore'

        qs = RelatedCompany.objects.filter(company=company)
        if kind:
            qs = qs.filter(kind=kind.lower())

        qs = qs.order_by("-created_at")

        if not qs.exists():
            msg = f"No related companies found for kind '{kind}'." if kind else "No related companies found."
            return Response({"error": msg}, status=404)

        companies_data = [
            {
                "kind": obj.kind,
                "name": obj.name,
                "logo": obj.logo,
                "sectors": obj.sectors if isinstance(obj.sectors, list) else [obj.sectors],
                "description": obj.description,
                "website": obj.website,
                "stock_symbol": obj.stock_symbol,
                "created_at": obj.created_at,
            }
            for obj in qs
        ]

        return Response({
            "company": company.short_name,
            "related_companies": companies_data,
        }, status=200)


    def post(self, request, *args, **kwargs):
        """
        Gera ou atualiza uma empresa relacionada usando o modelo RelatedCompany.
        """
        company = get_user_company(request.user)
        if not company:
            return Response({"error": "Company not found for this user."}, status=404)

        kind = request.data.get("kind", "competitor").lower()
        name = request.data.get("name")

        print(  "Request data:", request.data  )
        if not name:
            return Response({"error": "name is required."}, status=400)

        # Monta contexto com informações adicionais (opcionais)
        context_fields = []
        if request.data.get("stock_symbol"):
            context_fields.append(f"Stock Symbol: {request.data.get('stock_symbol')}")
        if request.data.get("website"):
            context_fields.append(f"Website: {request.data.get('website')}")
        if request.data.get("sectors"):
            sectors = request.data.get("sectors")
            if isinstance(sectors, list):
                context_fields.append(f"Sectors: {', '.join(sectors)}")
            else:
                context_fields.append(f"Sectors: {sectors}")

        prompt = f"""
        Find and fill out all these informations about the competitor "{name}" of the company "{company.long_name}". 
        Use as context the information provided by the user (they can be incomplete or not perfectly formatted):
        {"; ".join(context_fields) if context_fields else "No extra information was provided by the user."}
        
        For the competitor, return a json with:
        - Company Name
        - Official Logo URL (format: "https://logo.clearbit.com/companydomain.com")
        - Business Sectors (list)
        - Brief Description
        
        Output as a JSON compatible with this schema:
        {RelatedCompanyInfo.model_json_schema()}
        """

        try:
            completion = client.beta.chat.completions.parse(
                model="gpt-4o-search-preview",
                messages=[
                    {"role": "system", "content": f"Extract {kind} information from the web."},
                    {"role": "user", "content": prompt},
                ],
                response_format=RelatedCompanyInfo,
            )

            parsed = completion.choices[0].message.parsed.model_dump()

            obj, created = RelatedCompany.objects.update_or_create(
                company=company,
                kind=kind,
                name=name,
                defaults={
                    "stock_symbol": request.data.get("stock_symbol") or parsed.get("stock_symbol", ""),
                    "website": request.data.get("website", "") or parsed.get("stock_symbol", ""),
                    "logo": parsed.get("logo", ""),
                    "description": parsed.get("description", ""),
                    "sectors": request.data.get("sectors", "") or parsed.get("sectors", []),
                },
            )

            return Response(
                {
                    "result": "created" if created else "updated",
                    "kind": kind,
                    "company": obj.name,
                    "data": {
                        "name": obj.name,
                        "stock_symbol": obj.stock_symbol,
                        "website": obj.website,
                        "logo": obj.logo,
                        "description": obj.description,
                        "sectors": obj.sectors,
                    },
                },
                status=200,
            )

        except ValidationError as e:
            return Response({"error": str(e)}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def delete(self, request, *args, **kwargs):
        """
        Exclui uma empresa relacionada
        """
        company = get_user_company(request.user)
        if not company:
            return Response({"error": "Company not found for this user."}, status=404)

        kind = request.data.get("kind", "competitor").lower()
        name = request.data.get("name")

        if not name:
            return Response({"error": "name is required."}, status=400)

        qs = RelatedCompany.objects.filter(company=company, kind=kind, name=name)
        deleted, _ = qs.delete()

        if deleted:
            return Response({"result": f"{kind.capitalize()} '{name}' deleted."}, status=200)
        return Response({"error": f"{kind.capitalize()} '{name}' not found."}, status=404)
