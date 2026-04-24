from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('stocks', '0004_remove_stockentry_quantity_available'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='stockentry',
            name='total_cost',
        ),
        migrations.RemoveField(
            model_name='stockentry',
            name='unit_cost',
        ),
    ]
