from django.db import migrations, connection


def add_columns_sqlite_and_postgres(apps, schema_editor):
    vendor = connection.vendor
    with connection.cursor() as cursor:
        if vendor == 'sqlite':
            # SQLite: checa e cria, se necessário
            cursor.execute("PRAGMA table_info(core_companyinfo);")
            companyinfo_columns = [row[1] for row in cursor.fetchall()]
            if 'sources' not in companyinfo_columns:
                cursor.execute(
                    "ALTER TABLE core_companyinfo ADD COLUMN sources TEXT NULL;"
                )

            cursor.execute("PRAGMA table_info(core_marketnewsarticle);")
            marketnews_columns = [row[1] for row in cursor.fetchall()]
            if 'company_fk_id' not in marketnews_columns:
                cursor.execute(
                    "ALTER TABLE core_marketnewsarticle ADD COLUMN company_fk_id INTEGER REFERENCES core_companyinfo(id);"
                )

        elif vendor == 'postgresql':
            # PostgreSQL: checa existência antes de criar coluna
            # Adiciona sources na companyinfo, se não existir
            cursor.execute("""
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'core_companyinfo' AND column_name = 'sources'
            """)
            if not cursor.fetchone():
                cursor.execute(
                    "ALTER TABLE core_companyinfo ADD COLUMN sources TEXT NULL;")

            # Adiciona company_fk na MarketNewsArticle se não existir
            cursor.execute("""
                SELECT 1
                FROM information_schema.columns
                WHERE table_name = 'core_marketnewsarticle' AND column_name = 'company_fk_id'
            """)
            if not cursor.fetchone():
                cursor.execute(
                    "ALTER TABLE core_marketnewsarticle ADD COLUMN company_fk_id INTEGER REFERENCES core_companyinfo(id);")

        else:
            raise Exception(f"Unsupported database vendor: {vendor}")


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0044_remove_company_column_sql"),
    ]

    operations = [
        migrations.RunPython(add_columns_sqlite_and_postgres,
                             reverse_code=migrations.RunPython.noop),
    ]
