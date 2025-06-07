from django.contrib.auth.models import User
from django.db import models

class PerfilUsuario(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    nombres = models.CharField(max_length=100)
    dni = models.CharField(max_length=8)
    telefono = models.CharField(max_length=15)

    def __str__(self):
        return f"Perfil de {self.user.username}"
