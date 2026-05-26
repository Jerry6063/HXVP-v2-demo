from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('projects', '0003_callsheet_callsheetentry_checklist_checklistitem_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='shoot',
            name='description',
            field=models.TextField(blank=True),
        ),
    ]
