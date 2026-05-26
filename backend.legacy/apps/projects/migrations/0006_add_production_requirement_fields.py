from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("projects", "0005_consideration_models"),
    ]

    operations = [
        migrations.AddField(
            model_name="project",
            name="location",
            field=models.CharField(
                blank=True,
                max_length=255,
                help_text="Primary location / venue for this production",
            ),
        ),
        migrations.AddField(
            model_name="project",
            name="model_requirements",
            field=models.TextField(
                blank=True,
                help_text="Talent / model count, look, measurements, experience, etc.",
            ),
        ),
        migrations.AddField(
            model_name="project",
            name="crew_requirements",
            field=models.TextField(
                blank=True,
                help_text="Required crew roles, skills and headcount",
            ),
        ),
        migrations.AddField(
            model_name="project",
            name="other_requirements",
            field=models.TextField(
                blank=True,
                help_text="Any other specific production requirements",
            ),
        ),
    ]
