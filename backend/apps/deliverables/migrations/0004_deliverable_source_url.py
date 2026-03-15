from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("deliverables", "0003_add_new_contract_types_and_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="deliverable",
            name="source_url",
            field=models.URLField(
                blank=True,
                help_text="Optional cloud link for this asset/deliverable",
                max_length=500,
            ),
        ),
    ]
