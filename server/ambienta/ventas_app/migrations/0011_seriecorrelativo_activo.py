# Generated by Django 5.1.6 on 2025-06-05 20:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ventas_app', '0010_alter_pedido_tipo_comprobante_seriecorrelativo'),
    ]

    operations = [
        migrations.AddField(
            model_name='seriecorrelativo',
            name='activo',
            field=models.BooleanField(default=True),
        ),
    ]
