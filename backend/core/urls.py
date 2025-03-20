# core/urls.py
from django.urls import path
from .views import ExampleView, PerplexityAPIView, TranslateFileView, TranslateTextView, AudioTranscriptView, ElevenlabsTextToSpeechView

urlpatterns = [
    path('hello/', ExampleView.as_view(), name='hello'),
    path('perplexity/', PerplexityAPIView.as_view(), name='perplexity'),
    path('deepl/file/', TranslateFileView.as_view(), name='translatefile'),
    path('deepl/text/', TranslateTextView.as_view(), name='translatetext'),
    path('openai/audio-transcription/',
         AudioTranscriptView.as_view(), name='audio-transcription'),
    path('elevenlabs/text-to-speech/',
         ElevenlabsTextToSpeechView.as_view(), name='text-to-speech',),
]
