from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group

ROLES_VALIDOS = ['administrador', 'ventas', 'logistica']

class Command(BaseCommand):
    help = 'Asigna un rol (grupo) a un usuario existente, si el grupo existe'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str, help='Nombre de usuario')
        parser.add_argument('rol', type=str, help='Nombre del grupo (rol) a asignar')

    def handle(self, *args, **options):
        User = get_user_model()
        username = options['username']
        rol = options['rol']

        if rol not in ROLES_VALIDOS:
            raise CommandError(f"Rol inválido. Los roles válidos son: {', '.join(ROLES_VALIDOS)}")

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise CommandError(f"El usuario '{username}' no existe.")

        try:
            grupo = Group.objects.get(name=rol)
        except Group.DoesNotExist:
            raise CommandError(f"El grupo '{rol}' no existe. Asegúrate de haberlo creado en el sistema.")

        user.groups.add(grupo)
        user.save()

        self.stdout.write(self.style.SUCCESS(f"✅ Rol '{rol}' asignado al usuario '{username}'"))
