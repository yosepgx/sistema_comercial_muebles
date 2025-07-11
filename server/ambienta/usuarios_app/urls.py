# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GroupViewSet, PermissionViewSet, UserGroupViewSet, login, signup, test_token, logout, AdminPasswordResetView
from usuarios_app.viewsacceso import OlvideContrasenaAPIView, EstablecerContrasenaAPIView, VerificarTokenAPIView

router = DefaultRouter()
router.register(r'roles', GroupViewSet)
router.register(r'permisos', PermissionViewSet)
router.register(r'usuarios', UserGroupViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login',login),
    path('logout',logout),
    path('signup',signup),
    path('test_token',test_token),
    path('change-password/', AdminPasswordResetView.as_view(), name='change-password'),
    path('olvide-contrasena/',OlvideContrasenaAPIView.as_view()),
    path('establecer-contrasena/',EstablecerContrasenaAPIView.as_view()),
    path('verificar-token/', VerificarTokenAPIView.as_view())
]
