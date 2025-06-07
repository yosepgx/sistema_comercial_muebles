from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SedeViewSet, DgeneralViewSet

router = DefaultRouter()
router.register(r'sede', SedeViewSet)
router.register(r'datogeneral', DgeneralViewSet)

urlpatterns = [
    path('', include(router.urls)),
]