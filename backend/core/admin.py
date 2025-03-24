from django.contrib import admin
from core.models.esg_article_model import ESGArticle
# Register your models here.


@admin.register(ESGArticle)
class ESGArticleAdmin(admin.ModelAdmin):
    list_display = ("topic", "title", "author",
                    "source", "url", "date_published")
    list_filter = ("topic", "source", "date_published")
    search_fields = ("title", "summary", "author")
