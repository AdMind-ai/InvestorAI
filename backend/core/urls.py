# core/urls.py
from django.urls import path
from .views import ExampleView, PerplexityAPIView

urlpatterns = [
    path('hello/', ExampleView.as_view(), name='hello'),
    path('perplexity/', PerplexityAPIView.as_view(), name='perplexity'),
]
