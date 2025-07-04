# Generated by Django 5.1.6 on 2025-03-01 04:33

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='CategoriaCliente',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('descripcion', models.CharField(max_length=255, unique=True)),
                ('activo', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='Contacto',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=255)),
                ('correo', models.EmailField(max_length=254, unique=True)),
                ('telefono', models.CharField(blank=True, max_length=20, null=True)),
                ('direccion_entrega', models.TextField(blank=True, null=True)),
                ('tipo_interes', models.CharField(choices=[('cliente', 'Cliente'), ('lead', 'Lead')], max_length=10)),
                ('fecha_conversion', models.DateField(blank=True, null=True)),
                ('naturaleza', models.CharField(choices=[('Natural', 'Natural'), ('Empresa', 'Empresa')], max_length=10)),
                ('activo', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='Empresa',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('razon_social', models.CharField(max_length=255, unique=True)),
                ('RUC', models.CharField(max_length=11, unique=True)),
                ('telefono', models.CharField(blank=True, max_length=20, null=True)),
                ('correo', models.EmailField(max_length=254, unique=True)),
                ('direccion', models.TextField(blank=True, null=True)),
                ('activo', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='DocumentoID',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tipo', models.CharField(choices=[('DNI', 'DNI'), ('RUC', 'RUC'), ('CE', 'CE')], max_length=3)),
                ('cod_dni', models.CharField(blank=True, max_length=8, null=True)),
                ('cod_ruc', models.CharField(blank=True, max_length=11, null=True)),
                ('cod_ce', models.CharField(blank=True, max_length=9, null=True)),
                ('activo', models.BooleanField(default=True)),
                ('contacto', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='documentos', to='clientes_app.contacto')),
            ],
        ),
        migrations.AddField(
            model_name='contacto',
            name='empresa',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='clientes_app.empresa'),
        ),
    ]
