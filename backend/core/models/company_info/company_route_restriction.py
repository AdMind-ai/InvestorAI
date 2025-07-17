from django.db import models
from core.models.company_info.company_info import CompanyInfo

# Define a model to restrict access to certain routes based on company information


class CompanyRouteRestriction(models.Model):
    company = models.OneToOneField(CompanyInfo, on_delete=models.CASCADE)
    # Example: ["/market-intelligence", "/usage"]
    restricted_routes = models.JSONField(default=list)

    updated_at = models.DateTimeField(auto_now=True)
