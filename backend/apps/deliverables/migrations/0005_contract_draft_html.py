from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("deliverables", "0004_deliverable_source_url"),
    ]

    operations = [
        migrations.AddField(
            model_name="contract",
            name="draft_html",
            field=models.TextField(blank=True, default=""),
        ),
    ]
