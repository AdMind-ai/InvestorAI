import os
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model

User = get_user_model()

upload_path = 'upload/ayrshare/'


class ImageUpload(models.Model):
    image = models.ImageField(upload_to=upload_path, null=True, blank=True)
    image_url = models.URLField(blank=True, null=True)
    date_create = models.DateTimeField(
        _('date create'), auto_now_add=True, null=True
    )

    post = models.ForeignKey(
        to='api_ayrshare.Posts',
        verbose_name=_('post'),
        on_delete=models.CASCADE,
        related_name='post_image',
        null=True,
    )

    user = models.ForeignKey(
        to=User,
        verbose_name=_('user'),
        on_delete=models.CASCADE,
        related_name='ayrshare_images',
    )

    def __name(self):

        upload = os.path.join(settings.MEDIA_ROOT, 'upload')
        if not os.path.isdir(upload):
            os.mkdir(upload)

        ayrshare = os.path.join(upload, 'ayrshare')
        if not os.path.isdir(ayrshare):
            os.mkdir(ayrshare)

        user = os.path.join(ayrshare, f'user_{self.user.id}')
        if not os.path.isdir(user):
            os.mkdir(user)

        caminho = [os.path.join(user, nome) for nome in os.listdir(user)]
        arquivos = [arq for arq in caminho if os.path.isfile(arq)]
        arquivos = [arq for arq in arquivos if arq.lower().endswith('.png')]
        return os.path.join(f'user_{self.user.id}', f'{len(arquivos)+1}.png')

    def save_image_from_file(self, file):
        # try:
        self.image.save(self.__name(), file)
        self.image_url = self.image.url
        # except:
        #    ...
    def delete(self):
        try:
            os.remove(self.image.path)
        except:
            ...
        super(ImageUpload, self).delete()