from django.db import models
from django.conf import settings

class Part(models.Model):
    """
    Модель автозапчасти
    """
    # Категории запчастей (выбор из списка)
    CATEGORY_CHOICES = [
        ('engine', 'Двигатель'),
        ('transmission', 'Трансмиссия'),
        ('brakes', 'Тормозная система'),
        ('suspension', 'Подвеска'),
        ('electrics', 'Электрика'),
        ('body', 'Кузовные детали'),
        ('other', 'Другое'),
    ]
    
    # Название запчасти
    name = models.CharField(
        max_length=200,
        verbose_name='Название'
    )
    
    # Категория
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default='other',
        verbose_name='Категория'
    )
    
    # Производитель
    manufacturer = models.CharField(
        max_length=100,
        verbose_name='Производитель'
    )
    
    # Артикул (уникальный номер)
    sku = models.CharField(
        max_length=50,
        unique=True,
        verbose_name='Артикул'
    )
    
    # Цена
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Цена'
    )
    
    # Количество на складе
    stock = models.PositiveIntegerField(
        default=0,
        verbose_name='Количество на складе'
    )
    
    # Описание
    description = models.TextField(
        blank=True,
        verbose_name='Описание'
    )
    
    # Совместимость с автомобилями
    compatibility = models.CharField(
        max_length=200,
        blank=True,
        verbose_name='Совместимость'
    )

    # Фото запчасти
    image = models.ImageField(
        upload_to='parts/',
        blank=True,
        null=True,
        verbose_name='Фото запчасти'
    )
    
    # Дата добавления
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата добавления'
    )
    
    # Дата обновления
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Дата обновления'
    )
    
    def __str__(self):
        return f"{self.name} ({self.sku})"
    
    class Meta:
        verbose_name = 'Запчасть'
        verbose_name_plural = 'Запчасти'
        ordering = ['-created_at']


class Review(models.Model):
    part = models.ForeignKey(Part, on_delete=models.CASCADE, related_name='reviews')
    author = models.CharField(max_length=100, default='Аноним')
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.author} - {self.rating}★ - {self.part.name}'

    class Meta:
        ordering = ['-created_at']


class Cart(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart_items')
    part = models.ForeignKey(Part, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'part']

    def __str__(self):
        return f'{self.user.username} - {self.part.name} x{self.quantity}'


class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites')
    part = models.ForeignKey(Part, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'part']

    def __str__(self):
        return f'{self.user.username} - {self.part.name}'