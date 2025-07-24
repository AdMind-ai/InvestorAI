from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from pydantic import ValidationError
from openai import OpenAI
import os
from pydantic import BaseModel
from typing import List
from rest_framework import serializers
from datetime import datetime
from core.models.competitor_model import Competitor, CompetitorSearch
from django.db.models import Max
from core.utils.get_company_info import get_user_company, get_competitors
from core.models.company_info import CompetitorInfo as CompanyCompetitors
from rest_framework import status
from django.utils.timezone import now


class CompetitorInfo(BaseModel):
    company: str
    logo: str
    sectors: List[str]
    description: str
    website: str
    stock_symbol: str


class CompetitorInfoList(BaseModel):
    date: str
    competitors: List[CompetitorInfo]


client = OpenAI(api_key=os.getenv('OPENAI_KEY'))


class OpenAICompetitorSearchView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, *args, **kwargs):
        company = get_user_company(request.user)
        if not company:
            return Response(
                {"error": "No company assigned to user."},
                status=status.HTTP_400_BAD_REQUEST
            )
        company_name = company.short_name
        competitors = get_competitors(request.user)
        competitor_names = [c.name for c in competitors if c.name]
        competitor_block = "\n".join(competitor_names)

        if not company_name:
            return Response({"error": "Company name is required."}, status=400)

        prompt = f"""
        Identify at least 3 and max of 20 major competitors of {company_name}. For each competitor, provide:
        - Company Name
        - Official Logo URL (format: "https://logo.clearbit.com/companydomain.com")
        - Business Sectors (e.g., Technology, Finance, etc.)
        - Brief Description
        - Official Website URL
        - stock_symbol (if exists, else empty)

        Include those competitors:
        {competitor_block}
        """

        try:
            completion = client.beta.chat.completions.parse(
                model="gpt-4o-search-preview",
                messages=[
                    {"role": "system",
                        "content": "Extract competitor information from the web."},
                    {"role": "user", "content": prompt},
                ],
                # Specify list of CompetitorInfo
                response_format=CompetitorInfoList,
            )
            competitor_info = completion.choices[0].message.parsed.model_dump()

            search_record = CompetitorSearch.objects.create(
                company_name=company_name)

            for competitor in competitor_info['competitors']:
                Competitor.objects.create(
                    search=search_record,
                    competitor=competitor['company'],
                    logo=competitor['logo'],
                    sectors=competitor['sectors'],
                    description=competitor['description'],
                    website=competitor['website'],
                )

            for competitor in competitor_info['competitors']:
                company_kwargs = {
                    "company": company,
                    "name": competitor.get('company'),
                    "stock_symbol": competitor.get('stock_symbol', ''),
                    "sectors_company": company.sector or '',
                    "website": competitor.get('website', ''),
                    "logo": competitor.get('logo', ''),
                    "sectors_competitor": competitor.get('sectors', []),
                    "description": competitor.get('description', ''),
                }
                obj, created = CompanyCompetitors.objects.get_or_create(
                    company=company,
                    name=company_kwargs['name'],
                    defaults=company_kwargs
                )
                if not created:
                    for k, v in company_kwargs.items():
                        setattr(obj, k, v)
                    obj.save()

            return Response({
                "date": search_record.search_date,
                "competitors": competitor_info['competitors']
            }, status=200)

        except ValidationError as e:
            return Response({"error": str(e)}, status=400)

    def get(self, request, *args, **kwargs):
        company = get_user_company(request.user)
        if not company:
            return Response(
                {"error": "No company assigned to user."},
                status=status.HTTP_400_BAD_REQUEST
            )

        qs = CompanyCompetitors.objects.filter(
            company=company).order_by("-created_at")
        if not qs.exists():
            self.post(request, *args, **kwargs)
            qs = CompanyCompetitors.objects.filter(
                company=company).order_by("-created_at")
            if not qs.exists():
                return Response({"error": "No competitor data available and failed to create new entries."}, status=404)

        latest_date = qs.aggregate(Max("created_at"))[
            "created_at__max"] or now().date()

        response = {
            "date": latest_date,
            "company": company.short_name,
            # "sectors_company": company.sector or '',
            "competitors": [
                {
                    "competitor": obj.name,
                    "logo": obj.logo,
                    "sectors": obj.sectors_competitor if isinstance(obj.sectors_competitor, list) else [obj.sectors_competitor],
                    "description": obj.description,
                    "website": obj.website,
                    "stock_symbol": obj.stock_symbol,
                }
                for obj in qs
            ]
        }
        return Response(response, status=200)

    def put(self, request, *args, **kwargs):
        company = get_user_company(request.user)
        if not company:
            return Response({"error": "No company assigned to user."},
                            status=status.HTTP_400_BAD_REQUEST)

        data = request.data
        name = data.get("competitor") or data.get("name")
        if not name:
            return Response({"error": "Competitor name is required."}, status=400)

        # Monta o contexto das informações fornecidas pelo usuário
        context_fields = []
        if data.get("stock_symbol"):
            context_fields.append(f'Stock Symbol: {data.get("stock_symbol")}')
        if data.get("website"):
            context_fields.append(f'Website: {data.get("website")}')
        # Sectors pode vir como lista ou string
        sectors_value = data.get("sectors") or data.get("sectors_competitor")
        if sectors_value:
            if isinstance(sectors_value, list):
                context_fields.append(f'Sectors: {", ".join(sectors_value)}')
            else:
                context_fields.append(f'Sectors: {sectors_value}')

        # prompt para IA
        prompt = f"""
        Find and fill out all these informations about the competitor "{name}" of the company "{company.long_name}". 
        Use as context the information provided by the user (they can be incomplete or not perfectly formatted):
        {"; ".join(context_fields) if context_fields else "No extra information was provided by the user."}
        
        For the competitor, return a json with:
        - Company Name
        - Official Logo URL (format: "https://logo.clearbit.com/companydomain.com")
        - Business Sectors (list)
        - Brief Description
        - Official Website URL
        - Stock Symbol (if exists, else empty)
        
        Output as a JSON compatible with this schema:
        {CompetitorInfo.model_json_schema()}
        """

        try:
            completion = client.beta.chat.completions.parse(
                model="gpt-4o-search-preview",
                messages=[
                    {"role": "system",
                        "content": "Extract competitor information from the web."},
                    {"role": "user", "content": prompt},
                ],
                response_format=CompetitorInfo,
            )
            competitor = completion.choices[0].message.parsed.model_dump()

            # Salva no banco: get_or_create por company+name
            company_kwargs = {
                "company": company,
                "sectors_company": company.sector or '',
                "name": competitor.get('company'),
                "stock_symbol": competitor.get('stock_symbol', ''),
                "website": competitor.get('website', ''),
                "logo": competitor.get('logo', ''),
                "sectors_competitor": competitor.get('sectors', []),
                "description": competitor.get('description', ''),
            }
            obj, created = CompanyCompetitors.objects.get_or_create(
                company=company,
                name=company_kwargs['name'],
                defaults=company_kwargs
            )
            if not created:
                for k, v in company_kwargs.items():
                    setattr(obj, k, v)
                obj.save()

            return Response(
                {
                    "result": "created" if created else "updated",
                    "competitor": obj.name,
                    "data": {
                        "name": obj.name,
                        "stock_symbol": obj.stock_symbol,
                        "website": obj.website,
                        "logo": obj.logo,
                        "sectors_competitor": obj.sectors_competitor,
                        "description": obj.description,
                        "company": company.long_name,
                    }
                }, status=status.HTTP_200_OK
            )

        except ValidationError as e:
            return Response({"error": str(e)}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def delete(self, request, *args, **kwargs):
        company = get_user_company(request.user)
        if not company:
            return Response(
                {"error": "No company assigned to user."},
                status=status.HTTP_400_BAD_REQUEST
            )
        name = request.data.get("competitor") or request.data.get("name")
        if not name:
            return Response({"error": "Competitor name is required."}, status=400)
        qs = CompanyCompetitors.objects.filter(company=company, name=name)
        deleted_count, _ = qs.delete()
        if deleted_count:
            return Response(
                {"result": f"Competitor '{name}' deleted."},
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"error": f"Competitor '{name}' does not exist."},
                status=status.HTTP_404_NOT_FOUND
            )
