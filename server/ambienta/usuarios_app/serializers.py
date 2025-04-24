
from django.contrib.auth.models import Group, Permission, User
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

class UserGroupSerializer(serializers.ModelSerializer):
    """serializador de usuario"""
    groups = serializers.SlugRelatedField(slug_field='name', queryset=Group.objects.all(), many=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'groups']
