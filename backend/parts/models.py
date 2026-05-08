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
    

class Order(models.Model):
    STATUS_CHOICES = [
        ('new', 'Новый'),
        ('processing', 'В обработке'),
        ('paid', 'Оплачен'),
        ('shipped', 'Отправлен'),
        ('delivered', 'Доставлен'),
        ('cancelled', 'Отменён'),
    ]
    
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Наличными при получении'),
        ('card', 'Банковской картой онлайн'),
        ('erip', 'ЕРИП'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    
    # Данные получателя (копируются из профиля в момент заказа)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    city = models.CharField(max_length=100)
    street = models.CharField(max_length=200)
    house = models.CharField(max_length=20)
    apartment = models.CharField(max_length=20, blank=True)
    
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Поля для оплаты
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cash')
    paid = models.BooleanField(default=False)
    payment_id = models.CharField(max_length=100, blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f'Заказ #{self.id} - {self.user.username}'


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    part = models.ForeignKey(Part, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)  # цена на момент заказа
    
    def __str__(self):
        return f'{self.part.name} x{self.quantity}'