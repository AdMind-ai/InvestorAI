from django.contrib import admin
from django.db import models
from core.models.esg_article_model import ESGArticle
from core.models.ceo_article_model import CEOArticle
from core.models.openai_chat_models import ChatConversation, ChatMessage
from core.models.competitor_model import CompetitorSearch, Competitor
from core.models.market_article_model import MarketNewsArticle
from core.models.market_company_report import CompanyMarketReport
from core.models.company_stock_data_model import CompanyStockData
from core.models.company_quarterly_report import CompanyQuarterlyReport
from core.models.company_info import CompanyInfo, CEO, CompetitorInfo
from core.models.company_info.company_route_restriction import CompanyRouteRestriction
from core.models.frontend_master_route_list import MasterRouteList
from django import forms
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
    list_display = ("topic", "title",
                    "source", "created_at")
    list_filter = ("topic", "source", "date_published")
    search_fields = ("title", "summary", "author")


class CEOArticleAdminForm(forms.ModelForm):
    class Meta:
        model = CEOArticle
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        ceos = CEO.objects.all()
        self.fields['personality'].widget = forms.Select(
            choices=[(ceo.name, ceo.name) for ceo in ceos])


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
    list_display = ('company', 'type', 'title', 'date_published', 'created_at')
    list_filter = ('type', 'date_published', 'created_at')
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
    model = CompetitorInfo
    extra = 0


class CEOInline(admin.TabularInline):
    model = CEO
    extra = 0


@admin.register(CompanyInfo)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('long_name', 'stock_symbol', 'sector', 'country')
    inlines = [CompetitorInline, CEOInline]


@admin.register(CompetitorInfo)
class CompetitorAdmin(admin.ModelAdmin):
    list_display = ('name', 'stock_symbol', 'sector', 'company')


@admin.register(CEO)
class CEOAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'company')
