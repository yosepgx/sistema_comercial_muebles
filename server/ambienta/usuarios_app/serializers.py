
from django.contrib.auth.models import Group, Permission, User
from .models import PerfilUsuario
from rest_framework import serializers

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'codename', 'name', 'content_type']

class GroupSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=Permission.objects.all(),
        source='permissions'
    )

    class Meta:
        model = Group
        fields = ['id', 'name', 'permissions', 'permission_ids']

class PerfilUsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerfilUsuario
        fields = ['dni', 'telefono']

#La creacion de los campos de perfil solo se hace por front, no hay signal para hacerlo en back
class UserGroupSerializer(serializers.ModelSerializer):
    """serializador de usuario"""
    groups = serializers.SlugRelatedField(slug_field='name', queryset=Group.objects.all(), many=True)
    perfil = PerfilUsuarioSerializer()
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'groups', 'perfil']

    def update(self, instance, validated_data):
        perfil_data = validated_data.pop('perfil', {})
        # Actualiza el User
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.save()

        # Actualiza el Perfil
        perfil = instance.perfil
        perfil.dni = perfil_data.get('dni', perfil.dni)
        perfil.telefono = perfil_data.get('telefono', perfil.telefono)
        perfil.save()

        return instance

    def create(self, validated_data):
        perfil_data = validated_data.pop('perfil')
        user = User.objects.create(**validated_data)
        PerfilUsuario.objects.create(user=user, **perfil_data)
        return user
    
    