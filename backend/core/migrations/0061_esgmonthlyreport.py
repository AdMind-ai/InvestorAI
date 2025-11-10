from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0060_alter_marketnewsarticle_url'),
    ]

    operations = [
        migrations.CreateModel(
            name='ESGMonthlyReport',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('report_period', models.DateField(help_text='First day of the month this report covers (e.g. 2025-09-01).')),
                ('report_name', models.CharField(max_length=150)),
                ('report_description', models.TextField(help_text='Full markdown/text content of the monthly ESG report.')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('company', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='esg_monthly_reports', to='core.companyinfo')),
            ],
            options={
                'verbose_name': 'ESG Monthly Report',
                'verbose_name_plural': 'ESG Monthly Reports',
                'unique_together': {('company', 'report_period')},
            },
        ),
    ]
