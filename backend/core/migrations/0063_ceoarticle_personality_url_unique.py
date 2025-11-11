from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0062_rename_summary_esgarticle_description_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="ceoarticle",
            name="url",
            field=models.URLField(),
        ),
        migrations.AlterUniqueTogether(
            name="ceoarticle",
            unique_together={
                ("title", "personality"),
                ("personality", "url"),
            },
        ),
    ]