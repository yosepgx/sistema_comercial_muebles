# Generated by Django 5.1.6 on 2025-06-13 05:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('oportunidades_app', '0012_oportunidad_sede'),
    ]

    operations = [
        migrations.AddField(
            model_name='cotizacion',
            name='vendedor',
            field=models.CharField(default='MariaBenitez', max_length=200),
        ),
    ]
