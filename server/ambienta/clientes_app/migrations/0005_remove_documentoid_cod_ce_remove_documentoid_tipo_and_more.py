# Generated by Django 5.1.6 on 2025-05-08 22:24

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('clientes_app', '0004_remove_contacto_categoria_delete_categoriacliente'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='documentoid',
            name='cod_ce',
        ),
        migrations.RemoveField(
            model_name='documentoid',
            name='tipo',
        ),
        migrations.AlterField(
            model_name='documentoid',
            name='contacto',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='documentos', to='clientes_app.contacto'),
        ),
    ]
