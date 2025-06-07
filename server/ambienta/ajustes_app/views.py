from django.shortcuts import render
from rest_framework import viewsets
from .models import Dgeneral, Sede
from .serializers import DgeneralSerializer, SedeSerializer

# Create your views here.
class DgeneralViewSet(viewsets.ModelViewSet):
    queryset = Dgeneral.objects.all()
    serializer_class = DgeneralSerializer

class SedeViewSet(viewsets.ModelViewSet):
    queryset = Sede.objects.all()
    serializer_class = SedeSerializer

