from rest_framework import serializers
from .models import Dgeneral,Sede

class DgeneralSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dgeneral
        fields = '__all__'

class SedeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sede
        fields = '__all__'
