# Generated migration to remove unit_cost_at_sale and total_cost_at_sale fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sales_orders', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='stockallocation',
            name='unit_cost_at_sale',
        ),
        migrations.RemoveField(
            model_name='stockallocation',
            name='total_cost_at_sale',
        ),
    ]
