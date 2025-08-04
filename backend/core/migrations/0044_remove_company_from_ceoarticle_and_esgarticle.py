# core/migrations/0044_remove_company_from_ceoarticle_and_esgarticle.py

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0043_marketnewsarticle_company_fk_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='ceoarticle',
            name='company',
        ),
        migrations.RemoveField(
            model_name='esgarticle',
            name='company',
        ),
    ]
