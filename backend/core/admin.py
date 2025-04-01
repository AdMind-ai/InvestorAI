from django.contrib import admin
from core.models.esg_article_model import ESGArticle
from core.models.ceo_article_model import CEOArticle
from core.models.openai_chat_models import ChatConversation, ChatMessage
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


@admin.register(ChatConversation)
class ChatConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'user', 'created_at')
    list_filter = ('created_at', 'name')


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'content', 'is_user', 'created_at')
    list_filter = ('created_at', 'is_user')
    search_fields = ('content',)
