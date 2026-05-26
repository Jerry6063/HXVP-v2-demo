from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('crew', '0002_crewassignment_special_instructions_and_more'),
    ]

    operations = [
        # Drop the old unique_together constraint before adding the new field
        migrations.AlterUniqueTogether(
            name='crewavailability',
            unique_together=set(),
        ),
        migrations.AddField(
            model_name='crewavailability',
            name='period',
            field=models.CharField(
                choices=[('am', 'AM (Morning)'), ('pm', 'PM (Afternoon)'), ('full', 'Full Day')],
                default='full',
                max_length=4,
            ),
        ),
        migrations.AlterUniqueTogether(
            name='crewavailability',
            unique_together={('crew', 'date', 'period')},
        ),
    ]
