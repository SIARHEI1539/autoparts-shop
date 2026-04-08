
from django.contrib.admin import AdminSite
from django.contrib import admin

class CustomAdminSite(AdminSite):
    site_header = "Магазин автозапчастей"  # Верхний заголовок
    site_title = "Админка магазина"        # Тайтл вкладки браузера
    index_title = "Управление каталогом"   # Заголовок на главной странице

# Создаем экземпляр
custom_admin_site = CustomAdminSite(name='myadmin')