import base64
import hashlib
import random
import string

from cryptography.fernet import Fernet
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class Posts(models.Model):
    """Ayrshare posts"""

    profile = models.ForeignKey(
        to='api_ayrshare.Profiles',
        verbose_name=_('profile'),
        on_delete=models.CASCADE,
        related_name='posts',
    )
    platform_post_id = models.CharField(_('platform post id'), max_length=250)
    url = models.CharField(_('url'), max_length=250)
    platform = models.CharField(_('platform'), max_length=50)
    ayrshare_id = models.CharField(_('ayrshare id'), max_length=250)
    ref_id = models.CharField(_('ref id'), max_length=250)
    status = models.CharField(_('status'), max_length=20)
    message_error = models.TextField(_('message error'), null=True)
    text = models.TextField(_('text'), null=False, blank=False)
    image = models.CharField(_('image'), max_length=250, null=True)
    send_date = models.DateTimeField(
        _('send date'), auto_now_add=True, null=True
    )
    send_local_date = models.DateTimeField(
        _('send local date'), default=None, null=True
    )
    post_date = models.DateTimeField(_('post date'), default=None, null=True)

    class Meta:
        verbose_name = _('Post')
        verbose_name_plural = _('Posts')

    def __str__(self):
        return f'{self.status}'
