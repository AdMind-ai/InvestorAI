from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0065_ceo_additional_info_companyinfo_sources"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="GlossaryEntry",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("original", models.CharField(max_length=255)),
                ("translation", models.CharField(blank=True, default="", max_length=255)),
                ("target_langs", models.JSONField(blank=True, default=list)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "company",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="glossary_entries",
                        to="core.companyinfo",
                    ),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="glossary_entries",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Glossary Entry",
                "verbose_name_plural": "Glossary Entries",
                "ordering": ["id"],
            },
        ),
        migrations.AddIndex(
            model_name="glossaryentry",
            index=models.Index(fields=["company", "created_by"], name="core_glossa_company_9001dd_idx"),
        ),
        migrations.AddIndex(
            model_name="glossaryentry",
            index=models.Index(fields=["company"], name="core_glossa_company_8641c1_idx"),
        ),
        migrations.AddIndex(
            model_name="glossaryentry",
            index=models.Index(fields=["created_by"], name="core_glossa_created_4abf8f_idx"),
        ),
    ]
