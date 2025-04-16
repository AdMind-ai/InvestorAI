from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

User = get_user_model()

class Profiles(models.Model):
    """Ayrshare Profiles"""

    user = models.ForeignKey(
        to=User,
        verbose_name=_('user'),
        on_delete=models.CASCADE,
        related_name='profiles',
        null=False,
        blank=False,
    )

    key = models.CharField(_('key'), max_length=250)

    name = models.CharField(_('name'), max_length=250)
    ref_id = models.CharField(_('ref id'), max_length=250)
    description = models.CharField(
        _('description'), max_length=250, null=True, blank=True
    )
    creation_date = models.DateTimeField(_('creation date'), auto_now_add=True)


    class Meta:
        verbose_name = _('Profile')
        verbose_name_plural = _('Profiles')

    def __str__(self):
        return f'{self.user.email} - {self.name}'
