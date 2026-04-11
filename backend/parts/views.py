from rest_framework import viewsets
from .models import Part
from .serializers import PartSerializer

class PartViewSet(viewsets.ModelViewSet):
    """
    ViewSet для работы с запчастями.
    Автоматически даёт все CRUD операции:
    - GET /api/parts/ - список всех запчастей
    - POST /api/parts/ - добавить новую запчасть
    - GET /api/parts/{id}/ - получить одну запчасть
    - PUT /api/parts/{id}/ - обновить запчасть
    - DELETE /api/parts/{id}/ - удалить запчасть
    """
    queryset = Part.objects.all()  # Все запчасти из базы
    serializer_class = PartSerializer  # Какой сериализатор использовать
