from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('stocks', '0003_restore_stock_identifier'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='stockentry',
            name='quantity_available',
        ),
    ]
