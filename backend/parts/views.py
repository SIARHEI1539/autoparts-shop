from rest_framework import viewsets
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import Part
from .serializers import PartSerializer

class PartViewSet(viewsets.ModelViewSet):
    queryset = Part.objects.all()
    serializer_class = PartSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['category']  # ← фильтр по категории
    search_fields = ['name', 'manufacturer', 'sku']  # ← для будущего поиска