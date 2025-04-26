# core/views/__init__.py
from .example_view import ExampleView

from .perplexity import PerplexityDeepSearchView
from .perplexity import PerplexityESGNewsView
from .perplexity import PerplexityCEONewsView
from .perplexity import MonthlyMarketReportView

from .deepl import DeeplTranslateFileView
from .deepl import DeeplTranslateTextView

from .openai import OpenAiAudioTranscriptView
from .openai import OpenAIESGNewsView
from .openai import OpenAICEONewsView
from .openai import OpenAIConversationViewSet, OpenAISendMessageView
from .openai import OpenAISendAssistantMessageView
from .openai import OpenAICompetitorSearchView
from .openai import OpenAIInvestingDataScraper
from .openai import OpenAIMarketNewsView
from .openai import OpenAICompanyQuarterlyReportView

from .elevenlabs import ElevenlabsTextToSpeechView

from .combined_article_view import CombinedArticleViewSet
from .esg_article_view import ESGArticleViewSet
from .ceo_article_view import CEOArticleViewSet
from .stocks_view import (
    StockDataView,
    CompanyInfoView,
    SearchStocksView,
    FastInfoView,
    AnalystPriceTargetsView,
    RecommendationsView,
)

__all__ = [
    'PerplexityDeepSearchView',
    'PerplexityESGNewsView',
    'PerplexityCEONewsView',
    'MonthlyMarketReportView',
    'DeeplTranslateFileView',
    'DeeplTranslateTextView',
    'OpenAiAudioTranscriptView',
    'OpenAIESGNewsView',
    'OpenAICEONewsView',
    'OpenAIConversationViewSet',
    'OpenAISendMessageView',
    'OpenAIInvestingDataScraper',
    'OpenAICompetitorSearchView',
    'OpenAIMarketNewsView',
    'OpenAICompanyQuarterlyReportView',
    'ElevenlabsTextToSpeechView',
    'CombinedArticleViewSet',
    'ESGArticleViewSet',
    'CEOArticleViewSet',
    'OpenAISendAssistantMessageView',
    'StockDataView',
    'CompanyInfoView',
    'SearchStocksView',
    'FastInfoView',
    'AnalystPriceTargetsView',
    'RecommendationsView',
]
