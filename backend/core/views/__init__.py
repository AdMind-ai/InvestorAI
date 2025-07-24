# core/views/__init__.py
from .example_view import ExampleView

from .frontend_master_route_list_view import MasterRouteListUpdateView
from .company_info import CompanyInfoView as CompanyInfoViewAdm
from .company_route_restriction_view import CompanyRouteRestrictionView
from .newsapi import NewsApiMarketNewsView

from .perplexity import PerplexityDeepSearchView
from .perplexity import PerplexityESGNewsView
from .perplexity import PerplexityCEONewsView
from .perplexity import MonthlyMarketReportView
from .perplexity import GeneratePDFMonthlyMarketReportView

from .deepl import DeeplTranslateFileView
from .deepl import DeeplTranslateTextView
from .deepl import DeeplTranslateFileViewAsync, DeeplFileTaskStatusView

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

from .smartscan import SmartScanExtractView, SmartScanChatView
from .quickdoc_view import QuickDocGenerateView

from .competitor_old import CompetitorView

__all__ = [
    'MasterRouteListUpdateView',
    'CompanyInfoViewAdm',
    'CompanyRouteRestrictionView',
    'NewsApiMarketNewsView',
    'PerplexityDeepSearchView',
    'PerplexityESGNewsView',
    'PerplexityCEONewsView',
    'MonthlyMarketReportView',
    'GeneratePDFMonthlyMarketReportView',
    'DeeplTranslateFileView',
    'DeeplTranslateTextView',
    'DeeplTranslateFileViewAsync',
    'DeeplFileTaskStatusView',
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
    'SmartScanExtractView',
    'SmartScanChatView',
    'QuickDocGenerateView',
    'CompetitorView',
]
