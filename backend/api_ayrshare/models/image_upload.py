import os
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.auth import get_user_model
from azure.storage.blob import generate_blob_sas, BlobSasPermissions
from datetime import datetime, timedelta, timezone

User = get_user_model()

upload_path = 'upload/ayrshare/'


def user_upload_path(instance, filename):
    # Custom path in the Azure Blob container
    return f'upload/ayrshare/user_{instance.user.id}/{filename}'


class ImageUpload(models.Model):
    image = models.ImageField(
        upload_to=user_upload_path, null=True, blank=True)
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

    def save_image_from_file(self, file):
        # Salva a imagem no Azure Blob Storage
        self.image.save(file.name, file)

    def delete(self, *args, **kwargs):
        # Remove a imagem do Azure Blob e a instância do banco
        self.image.delete(save=False)
        super().delete(*args, **kwargs)

    def get_blob_sas_url(self, expires_in_minutes=60):
        """
        Gera uma SAS URL temporária para leitura da imagem no Azure Blob Storage.
        """
        # Pega o path do arquivo no container
        blob_name = self.image.name  # ex: "upload/ayrshare/arquivo.png"
        account_name = settings.AZURE_ACCOUNT_NAME
        account_key = settings.AZURE_ACCOUNT_KEY
        container_name = settings.AZURE_CONTAINER_NAME

        # Gera o SAS para leitura temporária
        sas_token = generate_blob_sas(
            account_name=account_name,
            account_key=account_key,
            container_name=container_name,
            blob_name=blob_name,
            permission=BlobSasPermissions(read=True),
            expiry=datetime.now(timezone.utc) +
            timedelta(minutes=expires_in_minutes)
        )
        blob_url = f"https://{account_name}.blob.core.windows.net/{container_name}/{blob_name}?{sas_token}"
        return blob_url
