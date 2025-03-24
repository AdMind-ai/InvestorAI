# core/urls.py
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'esg-articles', ESGArticleViewSet)

urlpatterns = [
    path('perplexity/deep-search',
         PerplexityDeepSearchView.as_view(), name='deep-search'),
    path('deepl/file/', DeeplTranslateFileView.as_view(), name='translate-file'),
    path('deepl/text/', DeeplTranslateTextView.as_view(), name='translate-text'),
    path('openai/audio-transcription/',
         OpenAiAudioTranscriptView.as_view(), name='audio-transcription'),
    path('elevenlabs/text-to-speech/',
         ElevenlabsTextToSpeechView.as_view(), name='text-to-speech',),
    path('perplexity/esg-news/', PerplexityESGNewsView.as_view(),
         name='perplexity-esg-news'),
    path('openai/esg-news/', OpenAIESGNewsView.as_view(), name='openai-esg-news'),
]

urlpatterns += router.urls
