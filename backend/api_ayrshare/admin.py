from django.conf import settings
from django.contrib import admin
from api_ayrshare.models import Profiles, Posts, ImageUpload
from django.utils.html import format_html


class ProfilesAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'creation_date']
    list_per_page = 30


class PostsAdmin(admin.ModelAdmin):

    def link(self, obj):
        return format_html(
            f'<a target="_blank" href="{obj.url}">{obj.url}</a>'
        )

    def user(self, obj):
        return obj.profile.user.email

    user.short_description = 'user'

    list_display = ['id', 'user', 'platform',
                    'status', 'post_date', 'link', 'message_error']
    list_display_links = ['user', 'platform', 'status']
    list_select_related = ['profile', 'profile__user']
    search_fields = ['profile__user__email', 'platform', 'text']
    list_filter = ['post_date', 'platform']
    list_per_page = 30


class ImageUploadAdmin(admin.ModelAdmin):
    def platform(self, obj):
        return obj.post.platform if obj.post else None
    platform.short_description = 'platform'

    def link(self, obj):
        if obj.image:
            url = obj.get_blob_sas_url(expires_in_minutes=10)
            return format_html(
                '<a target="_blank" href="{}"><img src="{}" alt="{}" width="120" height="120"></a>',
                url, url, obj.image.name
            )
        return "-"
    link.short_description = 'link'

    list_display = ['user', 'platform', 'link', 'date_create']
    list_per_page = 30


admin.site.register(Profiles, ProfilesAdmin)
admin.site.register(Posts, PostsAdmin)
admin.site.register(ImageUpload, ImageUploadAdmin)
