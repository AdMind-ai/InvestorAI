# core/urls.py PerplexityCEONewsView
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'articles', CombinedArticleViewSet, basename='articles')
router.register(r'articles/esg', ESGArticleViewSet, basename='esgarticle')
router.register(r'articles/ceo', CEOArticleViewSet, basename='ceoarticle')
router.register(r'openai/chat', OpenAIConversationViewSet,
                basename='openai-chat-conversation')

urlpatterns = [
    path('master-route-list/', MasterRouteListUpdateView.as_view(),
         name='master-route-list-update'),
    path('company-info/',
         CompanyInfoViewAdm.as_view(), name='company-info-adm'),
    path('company-route-restriction/',
         CompanyRouteRestrictionView.as_view(), name='company-route-restriction'),
    path('perplexity/deep-search/',
         PerplexityDeepSearchView.as_view(), name='deep-search'),
    path('perplexity/esg-news/', PerplexityESGNewsView.as_view(),
         name='perplexity-esg-news'),
    path('perplexity/ceo-news/', PerplexityCEONewsView.as_view(),
         name='perplexity-ceo-news'),
    path('perplexity/market-report/', MonthlyMarketReportView.as_view(),
         name='monthly-market-report'),
    path('perplexity/market-report/generate-pdf', GeneratePDFMonthlyMarketReportView.as_view(),
         name='generate-pdf-monthly-market-report'),
    # Translation Deepl
    path('deepl-sync/file/', DeeplTranslateFileView.as_view(), name='translate-file'),
    path('deepl/text/', DeeplTranslateTextView.as_view(), name='translate-text'),
    path('deepl/file/', DeeplTranslateFileViewAsync.as_view(),
         name='deepl-translate-file'),
    path('deepl/file/task_status/', DeeplFileTaskStatusView.as_view(),
         name='deepl-translate-file-status'),
    # OpenAI
    path('openai/audio-transcription/',
         OpenAiAudioTranscriptView.as_view(), name='audio-transcription'),
    path('openai/esg-news/', OpenAIESGNewsView.as_view(), name='openai-esg-news'),
    path('openai/ceo-news/', OpenAICEONewsView.as_view(), name='openai-ceo-news'),
    path('openai/market-news/', OpenAIMarketNewsView.as_view(),
         name='openai-market-news'),
    path('openai/competitors-search/', OpenAICompetitorSearchView.as_view(),
         name='openai-competitors-search'),
    path('openai/quarterly-report/', OpenAICompanyQuarterlyReportView.as_view(),
         name='openai-quarterly-report'),
    
#     path('openai/news/', OpenAINewsView.as_view(), name='openai-news'),
#     path('openai/news-test/', CollectMarketNewsView.as_view(), name='openai-news-test'),
#     path('openai/news-test/<str:task_id>/', CollectMarketNewsView.as_view(), name='openai-news-test'),
    
    # Chat
    path('openai/chat/send-message/', OpenAISendMessageView.as_view(),
         name='openai-chat-send-message'),
    path('openai/assistant/send-message/', OpenAISendAssistantMessageView.as_view(),
         name='openai-assistant-send-message'),
    path('elevenlabs/text-to-speech/',
         ElevenlabsTextToSpeechView.as_view(), name='text-to-speech',),
    path('openai/investing-scraper/', OpenAIInvestingDataScraper.as_view(),
         name='get_investing_data'),
    path('openai/chat/create-conversation/', ConversationForChatView.as_view(),
         name='openai-chat-create-conversation'),
    path('openai/chat/save-conversation/', SaveConversationView.as_view(),
         name='openai/chat/save-conversation'),

    # Stocks
    path('stocks/company-info/', CompanyInfoView.as_view(), name='company-info'),
    path('stocks/history/', StockDataView.as_view(), name='stock-data'),
    path('stocks/search/', SearchStocksView.as_view(), name='search-stocks'),
    path('stocks/fast-info/', FastInfoView.as_view(), name='fast-info'),
    path('stocks/analyst-price-targets/',
         AnalystPriceTargetsView.as_view(), name='analyst-price-targets'),
    path('stocks/recommendations/',
         RecommendationsView.as_view(), name='recommendations'),
    path('newsapi/market-news/', NewsApiMarketNewsView.as_view(),
         name='newsapi-market-news'),
    path('smartscan/extract/', SmartScanExtractView.as_view(),
         name='smartscan-extract'),
    path('smartscan/chat/', SmartScanChatView.as_view(), name='smartscan-chat'),
    path('quickdoc/generate/', QuickDocGenerateView.as_view(),
         name='quickdoc-generate'),
]

urlpatterns += router.urls
