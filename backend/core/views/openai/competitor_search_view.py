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


class CompetitorInfoSerializer(serializers.Serializer):
    company = serializers.CharField(max_length=255)


class CompetitorInfo(BaseModel):
    company: str
    logo: str
    sectors: List[str]
    description: str
    website: str


class CompetitorInfoList(BaseModel):
    date: str
    competitors: List[CompetitorInfo]


client = OpenAI(api_key=os.getenv('OPENAI_KEY'))


class OpenAICompetitorSearchView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    serializer_class = CompetitorInfoSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        company_name = request.data.get('company')
        print(company_name)
        if not company_name:
            return Response({"error": "Company name is required."}, status=400)

        prompt = f"""
        Identify at least 20 major competitors of {company_name}. For each competitor, provide:
        - Company Name
        - Official Logo URL (format: "https://logo.clearbit.com/companydomain.com")
        - Business Sectors (e.g., Technology, Finance, etc.)
        - Brief Description
        - Official Website URL
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
            print(competitor_info, type(competitor_info))

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

            return Response({
                "date": search_record.search_date,
                "competitors": competitor_info['competitors']
            }, status=200)

        except ValidationError as e:
            return Response({"error": str(e)}, status=400)

    def get(self, request, *args, **kwargs):
        recent = request.query_params.get('recent')
        company_name = request.query_params.get('company')

        if company_name:
            search_records = CompetitorSearch.objects.filter(
                company_name__iexact=company_name).order_by('-search_date')
        else:
            search_records = CompetitorSearch.objects.all()

        if recent is not None:
            latest_date = search_records.aggregate(Max('search_date'))[
                'search_date__max']
            search_records = search_records.filter(
                search_date=latest_date).order_by('-search_date')

        response_data = [
            {
                "date": search.search_date,
                "company": search.company_name,
                "competitors": [
                    {
                        "competitor": competitor.competitor,
                        "logo": competitor.logo,
                        "sectors": competitor.sectors,
                        "description": competitor.description,
                        "website": competitor.website,
                    }
                    for competitor in search.competitors.all()
                ]
            }
            for search in search_records
        ]

        return Response(response_data, status=200)
