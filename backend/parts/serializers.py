from rest_framework import serializers
from .models import Part

class PartSerializer(serializers.ModelSerializer):
    """
    Сериализатор для модели Part
    Превращает объект Part в JSON и обратно
    """
    
    class Meta:
        model = Part  # Какую модель переводим
        fields = '__all__'  # Все поля модели включаем в JSON
        # Можно указать конкретные поля: fields = ['id', 'name', 'price']