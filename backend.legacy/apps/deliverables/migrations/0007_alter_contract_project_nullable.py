from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("deliverables", "0006_contract_signature_fields"),
    ]

    operations = [
        migrations.AlterField(
            model_name="contract",
            name="project",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=models.deletion.CASCADE,
                related_name="contracts",
                to="projects.project",
            ),
        ),
    ]