from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status

from .services import ServiceCargarDatosOportunidades  # Importa la clase de servicios

