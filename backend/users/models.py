from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name='Фото')
    city = models.CharField(max_length=100, blank=True, verbose_name='Город')
    street = models.CharField(max_length=200, blank=True, verbose_name='Улица')
    house = models.CharField(max_length=20, blank=True, verbose_name='Дом')
    apartment = models.CharField(max_length=20, blank=True, verbose_name='Квартира/Офис')

    def __str__(self):
        return f'Профиль {self.user.username}'

    class Meta:
        verbose_name = 'Профиль'
        verbose_name_plural = 'Профили'