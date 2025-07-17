from django.db import models


class MasterRouteList(models.Model):
    # Exemplo: ["/market-intelligence", ...]
    routes = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"MasterRouteList ({self.updated_at.date()})"
