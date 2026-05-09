from django.contrib.admin import AdminSite
from django.contrib import admin
from django.contrib.auth.models import User, Group
from django.contrib.auth.admin import UserAdmin, GroupAdmin
from parts.models import Part, Review, Cart, Favorite, Order, OrderItem

class CustomAdminSite(AdminSite):
    site_header = "Магазин автозапчастей"
    site_title = "Админка магазина"
    index_title = "Управление магазином"

# Создаем экземпляр
custom_admin_site = CustomAdminSite(name='myadmin')

# Регистрация пользователей и групп в кастомной админке
custom_admin_site.register(User, UserAdmin)
custom_admin_site.register(Group, GroupAdmin)

# Регистрация моделей приложения parts
@admin.register(Part, site=custom_admin_site)
class PartAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'manufacturer', 'sku', 'price', 'stock', 'category']
    list_filter = ['category', 'manufacturer']
    search_fields = ['name', 'sku', 'manufacturer']
    list_editable = ['price', 'stock']
    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'category', 'manufacturer', 'sku', 'description')
        }),
        ('Цена и наличие', {
            'fields': ('price', 'stock')
        }),
        ('Дополнительно', {
            'fields': ('compatibility', 'image')
        }),
    )

@admin.register(Review, site=custom_admin_site)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'part', 'author', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['author', 'text', 'part__name']

@admin.register(Cart, site=custom_admin_site)
class CartAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'part', 'quantity', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'part__name']

@admin.register(Favorite, site=custom_admin_site)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'part', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'part__name']

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['part', 'quantity', 'price']
    can_delete = False

@admin.register(Order, site=custom_admin_site)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'first_name', 'last_name', 'total_price', 'status', 'paid', 'payment_method', 'created_at']
    list_filter = ['status', 'paid', 'payment_method', 'created_at', 'city']
    search_fields = ['id', 'user__username', 'first_name', 'last_name', 'email', 'phone']
    list_editable = ['status']
    readonly_fields = ['created_at', 'updated_at', 'total_price']
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('Информация о заказе', {
            'fields': ('id', 'user', 'status', 'paid', 'payment_method', 'total_price', 'created_at', 'updated_at')
        }),
        ('Данные получателя', {
            'fields': ('first_name', 'last_name', 'email', 'phone')
        }),
        ('Адрес доставки', {
            'fields': ('city', 'street', 'house', 'apartment')
        }),
        ('Платёжная информация', {
            'fields': ('payment_id',)
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj:
            return self.readonly_fields + ('id', 'user', 'total_price', 'created_at', 'updated_at')
        return self.readonly_fields

@admin.register(OrderItem, site=custom_admin_site)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'part', 'quantity', 'price']
    search_fields = ['order__id', 'part__name']
    readonly_fields = ['order', 'part', 'quantity', 'price']