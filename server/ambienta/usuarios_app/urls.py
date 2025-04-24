# urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GroupViewSet, PermissionViewSet, UserGroupViewSet
from rest_framework.authtoken.views import obtain_auth_token

router = DefaultRouter()
router.register(r'roles', GroupViewSet)  # Usamos Group como rol
router.register(r'permisos', PermissionViewSet)
router.register(r'usuarios', UserGroupViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('api-token-auth/', obtain_auth_token),
]
