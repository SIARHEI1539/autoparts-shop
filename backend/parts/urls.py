from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PartViewSet

# Создаём роутер (он сам генерирует все нужные URL)
router = DefaultRouter()
router.register(r'parts', PartViewSet)  # Регистрируем наш ViewSet

urlpatterns = [
    path('', include(router.urls)),  # Все URL начинаются с /api/
]