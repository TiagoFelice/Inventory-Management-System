from django.db import migrations, models


def populate_stock_identifiers(apps, schema_editor):
    StockEntry = apps.get_model('stocks', 'StockEntry')

    for entry in StockEntry.objects.filter(stock_identifier__isnull=True).iterator():
        entry.stock_identifier = f"STK-{entry.pk:06d}"
        entry.save(update_fields=['stock_identifier'])


class Migration(migrations.Migration):

    dependencies = [
        ('stocks', '0002_remove_stockentry_unique_stock_identifier_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='stockentry',
            name='stock_identifier',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.RunPython(populate_stock_identifiers, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='stockentry',
            name='stock_identifier',
            field=models.CharField(blank=True, max_length=255, unique=True),
        ),
        migrations.AddIndex(
            model_name='stockentry',
            index=models.Index(fields=['stock_identifier'], name='stock_entri_stock_i_eebbc0_idx'),
        ),
    ]
