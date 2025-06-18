from rest_framework import serializers
from .models import Cliente

# class DocumentoIDSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = DocumentoID
#         fields = '__all__'

class ClienteSerializer(serializers.ModelSerializer):
    #rdocumento = DocumentoIDSerializer(source= 'documento', read_only = True)
    class Meta:
        model = Cliente
        fields = '__all__'
        read_only_fields = ['fecha_conversion']
