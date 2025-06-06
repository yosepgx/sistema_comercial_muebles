from django.core.management.base import BaseCommand
from ajustes_app.models import Dgeneral, Sede
from django.contrib.auth.models import Group, Permission

class Command(BaseCommand):
    help = 'Carga datos iniciales: empresa, sedes y roles con permisos completos'

    def handle(self, *args, **kwargs):
        empresa, creada = Dgeneral.objects.get_or_create(
            codigo_RUC="12345678901",
            defaults={
                'razon_social': "Empresa Ejemplo S.A.C.",
                'nombre_comercial': "Ejemplo SAC",
                'direccion_fiscal': "Av. Siempre Viva 742",
                'margen_general': 5.00,
                'activo': True
            }
        )

        if creada:
            self.stdout.write(self.style.SUCCESS("✅ Empresa creada."))
        else:
            self.stdout.write("ℹ️ La empresa ya existía.")

        sede1, creada1 = Sede.objects.get_or_create(
            nombre="Sede A",
            dgeneral=empresa,
            defaults={'activo': True}
        )
        sede2, creada2 = Sede.objects.get_or_create(
            nombre="Sede B",
            dgeneral=empresa,
            defaults={'activo': True}
        )

        self.stdout.write("✅ Sede Central creada." if creada1 else "ℹ️ Sede Central ya existía.")
        self.stdout.write("✅ Sede Secundaria creada." if creada2 else "ℹ️ Sede Secundaria ya existía.")

        # Agregar todos los permisos a los grupos
        todos_los_permisos = Permission.objects.all()
        roles = ['administrador', 'ventas', 'logistica']

        for rol in roles:
            grupo, creado = Group.objects.get_or_create(name=rol)
            grupo.permissions.set(todos_los_permisos)
            grupo.save()
            if creado:
                self.stdout.write(self.style.SUCCESS(f"✅ Grupo '{rol}' creado"))
            else:
                self.stdout.write(f"ℹ️ Grupo '{rol}' ya existía. Permisos actualizados.")
