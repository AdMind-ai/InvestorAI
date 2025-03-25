# core/views/__init__.py
from .example_view import ExampleView

from .perplexity import PerplexityDeepSearchView
from .perplexity import PerplexityESGNewsView
from .perplexity import PerplexityCEONewsView
from .deepl import DeeplTranslateFileView
from .deepl import DeeplTranslateTextView
from .openai import OpenAiAudioTranscriptView
from .openai import OpenAIESGNewsView
from .openai import OpenAICEONewsView
from .elevenlabs import ElevenlabsTextToSpeechView
from .esg_article_view import ESGArticleViewSet
from .ceo_article_view import CEOArticleViewSet


__all__ = [
    'PerplexityDeepSearchView',
    'PerplexityESGNewsView',
    'PerplexityCEONewsView',
    'DeeplTranslateFileView',
    'DeeplTranslateTextView',
    'OpenAiAudioTranscriptView',
    'OpenAIESGNewsView',
    'OpenAICEONewsView',
    'ElevenlabsTextToSpeechView',
    'ESGArticleViewSet',
    'CEOArticleViewSet'
]
