# core/views/openai/__init__.py
from .audio_transcript_view import OpenAiAudioTranscriptView
from .esg_news_view import OpenAIESGNewsView


__all__ = [
    'OpenAiAudioTranscriptView',
    'OpenAIESGNewsView',
]
