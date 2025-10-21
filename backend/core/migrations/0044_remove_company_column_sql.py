from django.db import migrations, connection

def drop_company_columns_safe(apps, schema_editor):
    tables = ["core_ceoarticle", "core_esgarticle"]

    with connection.cursor() as cursor:
        for table in tables:
            if connection.vendor == "postgresql":
                # 1️⃣ Checa e remove constraint
                cursor.execute(
                    f"""
                    SELECT constraint_name
                    FROM information_schema.table_constraints
                    WHERE table_name='{table}' AND constraint_type='FOREIGN KEY';
                    """
                )
                constraints = [row[0] for row in cursor.fetchall()]
                for constraint in constraints:
                    print(f"Dropping constraint {constraint} on {table}")
                    cursor.execute(f"ALTER TABLE {table} DROP CONSTRAINT {constraint};")

                # 2️⃣ Checa e remove coluna
                cursor.execute(
                    f"""
                    SELECT column_name
                    FROM information_schema.columns
                    WHERE table_name='{table}' AND column_name='company_id';
                    """
                )
                if cursor.fetchone():
                    print(f"Dropping column company_id on {table}")
                    cursor.execute(f"ALTER TABLE {table} DROP COLUMN company_id;")
                else:
                    print(f"Column company_id does not exist on {table}, skipping")

            elif connection.vendor == "sqlite":
                # SQLite não suporta DROP COLUMN facilmente, mas tentamos
                cursor.execute(f"PRAGMA table_info({table});")
                columns = [row[1] for row in cursor.fetchall()]
                if "company_id" in columns:
                    print(f"Dropping column company_id on {table} (SQLite)")
                    try:
                        cursor.execute(f"ALTER TABLE {table} DROP COLUMN company_id;")
                    except Exception:
                        print(f"SQLite does not support DROP COLUMN for {table}, skipping")
                else:
                    print(f"Column company_id does not exist on {table}, skipping")

            else:
                # Para outros bancos que suportem DROP COLUMN IF EXISTS
                print(f"Attempting to drop column company_id on {table} (other DB)")
                try:
                    cursor.execute(f"ALTER TABLE {table} DROP COLUMN IF EXISTS company_id;")
                except Exception:
                    print(f"Failed to drop column company_id on {table}, skipping")


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0043_marketnewsarticle_company_fk_and_more"),
    ]

    operations = [
        migrations.RunPython(drop_company_columns_safe, reverse_code=migrations.RunPython.noop),
    ]
