# core/urls.py PerplexityCEONewsView
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'esg-articles', ESGArticleViewSet)
router.register(r'ceo-articles', CEOArticleViewSet)
router.register(r'openai/chat/conversations', OpenAIConversationViewSet,
                basename='openai-chat-conversation')

urlpatterns = [
    path('perplexity/deep-search/',
         PerplexityDeepSearchView.as_view(), name='deep-search'),
    path('perplexity/esg-news/', PerplexityESGNewsView.as_view(),
         name='perplexity-esg-news'),
    path('perplexity/ceo-news/', PerplexityCEONewsView.as_view(),
         name='perplexity-ceo-news'),
    path('deepl/file/', DeeplTranslateFileView.as_view(), name='translate-file'),
    path('deepl/text/', DeeplTranslateTextView.as_view(), name='translate-text'),
    path('openai/audio-transcription/',
         OpenAiAudioTranscriptView.as_view(), name='audio-transcription'),
    path('openai/esg-news/', OpenAIESGNewsView.as_view(), name='openai-esg-news'),
    path('openai/ceo-news/', OpenAICEONewsView.as_view(), name='openai-ceo-news'),
    # Chat
    path('openai/chat/send-message/', OpenAISendMessageView.as_view(),
         name='openai-chat-send-message'),
     path('openai/assistant/send-message/', OpenAISendAssistantMessageView.as_view(),
         name='openai-assistant-send-message'),
    # path('openai/chat/upload'),

    path('elevenlabs/text-to-speech/',
         ElevenlabsTextToSpeechView.as_view(), name='text-to-speech',),
]

urlpatterns += router.urls
