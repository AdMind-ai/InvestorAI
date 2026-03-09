from django.contrib import admin
from django import forms
from core.models.openai_ceo_conversaitons_model import CEOConversation
from core.models.esg_article_model import ESGArticle
from core.models.esg_monthly_report_model import ESGMonthlyReport
from core.models.ceo_article_model import CEOArticle
from core.models.openai_chat_models import ChatConversation, ChatMessage
from core.models.competitor_model import CompetitorSearch, Competitor
from core.models.market_article_model import MarketNewsArticle, MarketNewsSetup
from core.models.market_company_report import CompanyMarketReport
from core.models.company_stock_data_model import CompanyStockData
from core.models.company_quarterly_report import CompanyQuarterlyReport
from core.models.company_info import CompanyInfo, CEO, RelatedCompany
from core.models.feature_usage import FeatureUsage
from core.models.company_info.company_route_restriction import CompanyRouteRestriction
from core.models.frontend_master_route_list import MasterRouteList
from core.models.summary_news_model import SummaryNewsArticle
from core.models.linkedin_scheduled_post import LinkedinScheduledPost
from core.models.market_news_alert_preference import MarketNewsAlertPreference
from core.models.glossary_entry import GlossaryEntry
from core.models.deepl_glossary_reference import DeepLGlossaryReference
# Register your models here.


class CompanyRouteRestrictionForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        master = MasterRouteList.objects.first()
        route_choices = [(r, r) for r in master.routes] if master else []
        if route_choices:
            self.fields['restricted_routes'] = forms.MultipleChoiceField(
                choices=route_choices,
                initial=self.instance.restricted_routes if self.instance else [],
                required=False,
                widget=admin.widgets.FilteredSelectMultiple(
                    'routes', is_stacked=False)
            )
        else:
            self.fields['restricted_routes'] = forms.CharField(
                widget=admin.widgets.AdminTextareaWidget(
                    attrs={"rows": 8, "cols": 60}),
                required=False,
                initial=", ".join(
                    self.instance.restricted_routes) if self.instance and self.instance.restricted_routes else ""
            )

    class Meta:
        model = CompanyRouteRestriction
        fields = '__all__'

    def clean_restricted_routes(self):
        data = self.cleaned_data['restricted_routes']
        if isinstance(data, str):
            return [d.strip() for d in data.split(",") if d.strip()]
        return list(data)


@admin.register(CompanyRouteRestriction)
class CompanyRouteRestrictionAdmin(admin.ModelAdmin):
    form = CompanyRouteRestrictionForm
    list_display = ('company', 'updated_at')
    search_fields = ('company__long_name',)
    list_filter = ('company',)


@admin.register(ESGArticle)
class ESGArticleAdmin(admin.ModelAdmin):
    list_display = ("topic", "title", "date_published", "created_at")
    list_filter = ("topic", "date_published")
    search_fields = ("title", "description", "url")


@admin.register(ESGMonthlyReport)
class ESGMonthlyReportAdmin(admin.ModelAdmin):
    list_display = ("company", "report_period", "report_name", "created_at")
    list_filter = ("company", "report_period")
    search_fields = ("report_name", "company__long_name")
    date_hierarchy = 'report_period'
    ordering = ("-report_period",)


class CEOArticleAdminForm(forms.ModelForm):
    class Meta:
        model = CEOArticle
        fields = '__all__'


@admin.register(CEOArticle)
class CEOArticleAdmin(admin.ModelAdmin):
    form = CEOArticleAdminForm
    list_display = ['personality', 'title', 'created_at']


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
    list_display = ('company', 'company_fk', 'type', 'title', 'date_published', 'created_at')
    list_filter = ('type', 'date_published', 'created_at', 'company_fk')
    search_fields = ('company', 'title', 'url')
    ordering = ('-created_at',)


@admin.register(CompanyMarketReport)
class CompanyMarketReportAdmin(admin.ModelAdmin):
    list_display = ('company', 'report', 'created_at')
    search_fields = ('company',)
    ordering = ('-created_at',)


@admin.register(CompanyStockData)
class CompanyStockDataAdmin(admin.ModelAdmin):
    list_display = (
        'date',
        'company',
        'stock_symbol',
        'stock_exchange',
        'stock_price_today_usd',
        'market_cap_usd',
        'pe_ratio',
    )
    search_fields = ('company', 'stock_symbol', 'stock_exchange', 'date')
    list_filter = ('company', 'stock_exchange', 'date')


@admin.register(CompanyQuarterlyReport)
class CompanyQuarterlyReportAdmin(admin.ModelAdmin):
    list_display = ('company', 'quarter', 'year',
                    'created_at', 'has_insight_report')
    list_filter = ('company', 'quarter', 'year', 'created_at')
    search_fields = ('company', 'year', 'quarter')
    ordering = ('-year', '-quarter')

    @admin.display(boolean=True, description='Has Insight Report')
    def has_insight_report(self, obj):
        return bool(obj.insight_report)


class CompetitorInline(admin.TabularInline):
    model = RelatedCompany
    extra = 0


class CEOInline(admin.TabularInline):
    model = CEO
    extra = 0


@admin.register(CompanyInfo)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('long_name', 'stock_symbol', 'sector', 'country')
    inlines = [CompetitorInline, CEOInline]


@admin.register(RelatedCompany)
class CompetitorAdmin(admin.ModelAdmin):
    list_display = ('name', 'kind', 'stock_symbol', 'sectors', 'company', 'created_at')


@admin.register(CEO)
class CEOAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'company', 'additional_info')


@admin.register(CEOConversation)
class CEOConversationAdmin(admin.ModelAdmin):
    list_display = ('company', 'ceo', 'conversation_id', 'created_at')


@admin.register(FeatureUsage)
class FeatureUsageAdmin(admin.ModelAdmin):
    list_display = ('module', 'feature', 'company', 'count', 'max_limit', 'last_used')
    list_filter = ('module', 'feature', 'company')
    readonly_fields = ('last_used',)


@admin.register(LinkedinScheduledPost)
class LinkedinScheduledPostAdmin(admin.ModelAdmin):
    list_display = ('id', 'company', 'created_by', 'scheduled_at', 'created_at')
    search_fields = ('text', 'company__long_name', 'created_by__username')
    list_filter = ('company',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(SummaryNewsArticle)
class SummaryNewsArticleAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'company', 'type', 'category', 'relevance', 'created_at'
    )
    list_filter = ('type', 'category', 'relevance', 'created_at', 'company_fk')
    search_fields = ('title', 'description', 'company')
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    list_per_page = 25
    
@admin.register(MarketNewsAlertPreference)
class MarketNewsAlertPreferenceAdmin(admin.ModelAdmin):
    list_display = ('company', 'email', 'category', 'enabled', 'relevance', 'created_at')
    search_fields = ('email', 'company__long_name')
    list_filter = ('category', 'enabled', 'relevance', 'company')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)
    list_per_page = 10


@admin.register(GlossaryEntry)
class GlossaryEntryAdmin(admin.ModelAdmin):
    list_display = ('original', 'translation', 'company', 'created_by', 'updated_at')
    search_fields = ('original', 'translation', 'company__long_name', 'created_by__username')
    list_filter = ('company', 'created_by')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(DeepLGlossaryReference)
class DeepLGlossaryReferenceAdmin(admin.ModelAdmin):
    list_display = ('glossary_name', 'deepl_glossary_id', 'scope', 'company', 'created_by', 'entry_count', 'last_synced_at')
    search_fields = ('glossary_name', 'deepl_glossary_id', 'company__long_name', 'created_by__username')
    list_filter = ('scope', 'company', 'created_by')
    readonly_fields = ('created_at', 'updated_at', 'last_synced_at')
    
@admin.register(MarketNewsSetup)
class MarketNewsSetupAdmin(admin.ModelAdmin):
    list_display = ('company', 'is_configured', 'configured_at')
    search_fields = ('company__long_name',)
    list_filter = ('is_configured', 'configured_at')
    ordering = ('-configured_at',)