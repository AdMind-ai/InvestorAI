# core/urls.py
from django.urls import path
from .views import ExampleView

urlpatterns = [
    path('hello/', ExampleView.as_view(), name='hello'),
]
