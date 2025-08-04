from django.db import migrations, connection


def drop_columns_sqlite(apps, schema_editor):
    with connection.cursor() as cursor:
        # CEOArticle
        try:
            cursor.execute(
                "ALTER TABLE core_ceoarticle DROP COLUMN company_id;")
        except Exception:
            pass
        # ESGArticle
        try:
            cursor.execute(
                "ALTER TABLE core_esgarticle DROP COLUMN company_id;")
        except Exception:
            pass


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0043_marketnewsarticle_company_fk_and_more"),
    ]

    operations = [
        migrations.RunPython(drop_columns_sqlite,
                             reverse_code=migrations.RunPython.noop),
        migrations.RunSQL(
            [
                # PostgreSQL e afins:
                "ALTER TABLE core_ceoarticle DROP CONSTRAINT IF EXISTS core_ceoarticle_company_id_fk;",
                "ALTER TABLE core_ceoarticle DROP COLUMN IF EXISTS company_id CASCADE;",
                "ALTER TABLE core_esgarticle DROP CONSTRAINT IF EXISTS core_esgarticle_company_id_fk;",
                "ALTER TABLE core_esgarticle DROP COLUMN IF EXISTS company_id CASCADE;",
            ],
            []
        ),
    ]
