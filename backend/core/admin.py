from django.contrib import admin
from core.models.esg_article_model import ESGArticle
from core.models.ceo_article_model import CEOArticle
from core.models.openai_chat_models import ChatConversation, ChatMessage
from core.models.competitor_model import CompetitorSearch, Competitor
from core.models.market_article_model import MarketNewsArticle
from core.models.market_company_report import CompanyMarketReport
# Register your models here.


@admin.register(ESGArticle)
class ESGArticleAdmin(admin.ModelAdmin):
    list_display = ("topic", "title", "author",
                    "source", "url", "date_published")
    list_filter = ("topic", "source", "date_published")
    search_fields = ("title", "summary", "author")


@admin.register(CEOArticle)
class CEOArticleAdmin(admin.ModelAdmin):
    list_display = ("personality", "title",
                    "source", "url", "date_published")
    list_filter = ("personality", "source", "date_published")
    search_fields = ("title", "content", "author")


class ChatMessageInline(admin.StackedInline):
    model = ChatMessage
    extra = 0


@admin.register(ChatConversation)
class ChatConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'user', 'created_at')
    list_filter = ('created_at', 'name')
    inlines = [ChatMessageInline]


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'content', 'is_user', 'created_at')
    list_filter = ('created_at', 'is_user')
    search_fields = ('content',)


class CompetitorInline(admin.StackedInline):
    model = Competitor
    extra = 0


@admin.register(CompetitorSearch)
class CompetitorSearchAdmin(admin.ModelAdmin):
    list_display = ('search_date', 'company_name', 'sector')
    list_filter = ('search_date',)
    search_fields = ('company_name',)
    inlines = [CompetitorInline]


# @admin.register(Competitor)
# class CompetitorAdmin(admin.ModelAdmin):
#     list_display = ('competitor', 'search', 'logo', 'website')
#     search_fields = ('competitor',)


@admin.register(MarketNewsArticle)
class MarketNewsArticleAdmin(admin.ModelAdmin):
    list_display = ('company', 'type', 'title', 'date_published', 'created_at')
    list_filter = ('type', 'date_published', 'created_at')
    search_fields = ('company', 'title', 'url')
    ordering = ('-created_at',)


@admin.register(CompanyMarketReport)
class CompanyMarketReportAdmin(admin.ModelAdmin):
    list_display = ('company', 'report', 'created_at')
    search_fields = ('company',)
    ordering = ('-created_at',)
