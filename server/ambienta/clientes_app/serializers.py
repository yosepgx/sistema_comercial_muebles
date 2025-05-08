from rest_framework import serializers
from .models import DocumentoID, Contacto

class DocumentoIDSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentoID
        fields = '__all__'

class ContactoSerializer(serializers.ModelSerializer):
    rdocumento = DocumentoIDSerializer(source= 'documento', readonly = True)
    class Meta:
        model = Contacto
        fields = '__all__'
