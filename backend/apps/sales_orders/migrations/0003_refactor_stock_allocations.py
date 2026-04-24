from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('sales_orders', '0002_remove_cost_fields'),
    ]

    operations = [
        migrations.AlterField(
            model_name='stockallocation',
            name='sales_order_item',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='allocations', to='sales_orders.salesorderitem'),
        ),
        migrations.AddField(
            model_name='stockallocation',
            name='type',
            field=models.CharField(choices=[('sale', 'Sale'), ('expired', 'Expired'), ('other', 'Other')], default='sale', max_length=20),
        ),
        migrations.AddField(
            model_name='stockallocation',
            name='notes',
            field=models.TextField(blank=True, null=True),
        ),
    ]
