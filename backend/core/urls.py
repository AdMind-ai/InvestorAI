# core/urls.py PerplexityCEONewsView
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import *
from .views.esg_news_task_view import (
     ESGNewsFetchTriggerView,
     ESGMonthlyReportTriggerView,
     ESGNewsTaskStatusView,
)
from .views.summary_news_view import SummaryNewsListView
from .views.openai.linkedin_post_view import LinkedinPostView
from .views.openai.linkedin_scheduled_post_view import LinkedinScheduledPostView
from .views.market_news_alert_preference_view import MarketNewsAlertPreferenceView

router = DefaultRouter()
router.register(r'articles', CombinedArticleViewSet, basename='articles')
router.register(r'articles/esg', ESGArticleViewSet, basename='esgarticle')
router.register(r'articles/ceo', CEOArticleViewSet, basename='ceoarticle')
router.register(r'openai/chat', OpenAIConversationViewSet,
                basename='openai-chat-conversation')

urlpatterns = [
     path('master-route-list/', 
          MasterRouteListUpdateView.as_view(), name='master-route-list-update'),
     path('company-info/',
          CompanyInfoViewAdm.as_view(), name='company-info-adm'),
     path('company-route-restriction/',
          CompanyRouteRestrictionView.as_view(), name='company-route-restriction'),
     
     path('company-info/sector/', 
          CompanyInfoSectorView.as_view(),
          name='company-sector-info'),
     path("company-info/marketing-setup/", 
          MarketNewsSetupView.as_view(), name="marketing-setup"),
     
     # Market Intelligence - Sector News
     path('market-sector-news/company/', 
          MarketSectorNewsTriggerView.as_view(),
          name='market-sector-news-company'),
     path('market-sector-news/all/', 
          MarketSectorNewsAllTriggerView.as_view(),
          name='market-sector-news-all'),
     path('market-sector-news/status/<str:task_id>/', 
          MarketSectorNewsStatusView.as_view(), 
          name='market-sector-news-status'),
     
     # Market Intelligence - Competitors News
     path('market-competitors-news/company/', 
          MarketCompetitorsNewsTriggerView.as_view(),
          name='market-competitors-news-company'),
     path('market-competitors-news/all/', 
          MarketCompetitorsNewsAllTriggerView.as_view(),
          name='market-competitors-news-all'),
     path('market-competitors-news/status/<str:task_id>/', 
          MarketCompetitorsNewsStatusView.as_view(), 
          name='market-competitors-news-status'),
     
     # Market Intelligence - Summary
     path('market-summary-news/', SummaryNewsListView.as_view(), name='market-summary-news'),

     # Market Intelligence - Task Monthly Report
     path('market-monthly-report/company/', 
          MarketMonthlyReportTriggerView.as_view(),
          name='market-monthly-report-company'),
     path('market-monthly-report/status/<str:task_id>/', 
          MarketMonthlyReportStatusView.as_view(), 
          name='market-monthly-report-status'),
     
     # Market Intelligence - Monthly Report
     path('market-monthly-report/task/', 
          MarketMonthlyReportTriggerView.as_view(), name='market-monthly-report-task'),
     path('market-monthly-report/status/<str:task_id>/', 
          MarketMonthlyReportStatusView.as_view(), name='market-monthly-report-status'),
     path('market-monthly-report/latest/', 
          MarketMonthlyReportLatestView.as_view(), name='market-monthly-report-latest'),
     
     # Market Intelligence - Alert Preferences (email + categories)
     path('market-alert-preferences/', MarketNewsAlertPreferenceView.as_view(),
          name='market-alert-preferences'),

    
     path('perplexity/deep-search/',
          PerplexityDeepSearchView.as_view(), name='deep-search'),
     path('perplexity/esg-news/', PerplexityESGNewsView.as_view(),
          name='perplexity-esg-news'),
     path('perplexity/ceo-news/', PerplexityCEONewsView.as_view(),
          name='perplexity-ceo-news'),
     
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
     # ESG News (Custom tasks & monthly reports separation)
     path('esg-news/fetch/', ESGNewsFetchTriggerView.as_view(), name='esg-news-fetch'),
     path('esg-news/report/', ESGMonthlyReportTriggerView.as_view(), name='esg-news-monthly-report'),
     path('esg-news/task-status/<str:task_id>/', ESGNewsTaskStatusView.as_view(), name='esg-news-task-status'),
     path('esg-news/monthly-reports/', ESGMonthlyReportListView.as_view(), name='esg-news-monthly-reports'),
     path('esg-news/monthly-reports/generate-pdf', GeneratePDFMonthlyMarketReportView.as_view(),
          name='generate-pdf-monthly-market-report'),
     
     path('openai/market-news/', OpenAIMarketNewsView.as_view(),
          name='openai-market-news'),
     path('openai/competitors-search/', OpenAICompetitorSearchView.as_view(),
          name='openai-competitors-search'),
     path('openai/quarterly-report/', OpenAICompanyQuarterlyReportView.as_view(),
          name='openai-quarterly-report'),
     path("openai/ceo-news/task", 
          WeeklyCEONewsTaskView.as_view(), name="collect_ceo_news_task"),

     # Chat
     path('openai/chat/send-message/', OpenAISendMessageView.as_view(),
          name='openai-chat-send-message'),
     path('openai/assistant/send-message/', OpenAISendAssistantMessageView.as_view(),
          name='openai-assistant-send-message'),
     path('elevenlabs/text-to-speech/',
          ElevenlabsTextToSpeechView.as_view(), name='text-to-speech',),
     path('openai/investing-scraper/', OpenAIInvestingDataScraper.as_view(),
          name='get_investing_data'),
     path('openai/linkedin-post/', LinkedinPostView.as_view(), name='openai-linkedin-post'),
     path('openai/linkedin-scheduled/', LinkedinScheduledPostView.as_view(), name='openai-linkedin-scheduled'),
         # Feature usage endpoint
         path('usage/feature/',
              __import__('core.views.feature_usage_view', fromlist=['']).FeatureUsageIncrementView.as_view(),
              name='feature-usage-increment'),
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

