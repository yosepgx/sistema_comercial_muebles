# Generated by Django 5.1.6 on 2025-05-25 02:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('clientes_app', '0006_alter_documentoid_contacto'),
    ]

    operations = [
        migrations.AddField(
            model_name='contacto',
            name='cod_dni',
            field=models.CharField(blank=True, max_length=8, null=True),
        ),
        migrations.AddField(
            model_name='contacto',
            name='cod_ruc',
            field=models.CharField(blank=True, max_length=11, null=True),
        ),
        migrations.DeleteModel(
            name='DocumentoID',
        ),
    ]
