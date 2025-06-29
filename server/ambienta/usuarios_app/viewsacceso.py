# views.py
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils.http import urlsafe_base64_decode
from ambienta.settings import EMAIL_HOST_USER, FRONTEND_URL
from rest_framework.permissions import AllowAny

class OlvideContrasenaAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist :
            return Response({"message": "Si el correo existe, se envió un enlace"}, status=200)
        if not user.is_active:
            return Response({"message": "Si el correo existe, se envió un enlace"}, status=200)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        frontend_url = f"{FRONTEND_URL}/establecer-contrasena?uid={uid}&token={token}"
        try:
            send_mail(
                "Restablece tu contraseña",
                f"Haz clic en este enlace para cambiar tu contraseña:\n{frontend_url}",
                EMAIL_HOST_USER,
                [user.email],
                fail_silently=False,
            )
        except Exception as e:
            print(f'Error al enviar correo: {e}')

        return Response({"message": "Enlace enviado"}, status=200)



class EstablecerContrasenaAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uidb64 = request.data.get("uid")
        token = request.data.get("token")
        password1 = request.data.get("nueva_contrasena")
        password2 = request.data.get("confirmar_contrasena")

        if password1 != password2:
            return Response({"error": "Las contraseñas no coinciden"}, status=400)

        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except Exception:
            return Response({"error": "Token o usuario inválido"}, status=400)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Token inválido o expirado"}, status=400)

        user.set_password(password1)
        user.save()

        return Response({"message": "Contraseña actualizada correctamente"}, status=200)

class VerificarTokenAPIView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        uidb64 = request.query_params.get("uid")
        token = request.query_params.get("token")

        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except Exception:
            return Response({"valid": False}, status=200)

        is_valid = default_token_generator.check_token(user, token)
        return Response({"valid": is_valid}, status=200)