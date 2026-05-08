from django.contrib import admin
from .models import Part, Review, Cart, Favorite, Order, OrderItem

@admin.register(Part)
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

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'part', 'author', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['author', 'text', 'part__name']

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'part', 'quantity', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'part__name']

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'part', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__username', 'part__name']

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['part', 'quantity', 'price']
    can_delete = False

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'first_name', 'last_name', 'total_price', 'status', 'created_at']
    list_filter = ['status', 'created_at', 'city']
    search_fields = ['id', 'user__username', 'first_name', 'last_name', 'email', 'phone']
    list_editable = ['status']
    readonly_fields = ['created_at', 'updated_at', 'total_price']
    inlines = [OrderItemInline]
    
    fieldsets = (
        ('Информация о заказе', {
            'fields': ('id', 'user', 'status', 'total_price', 'created_at', 'updated_at')
        }),
        ('Данные получателя', {
            'fields': ('first_name', 'last_name', 'email', 'phone')
        }),
        ('Адрес доставки', {
            'fields': ('city', 'street', 'house', 'apartment')
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # При редактировании существующего заказа
            return self.readonly_fields + ('id', 'user', 'total_price', 'created_at', 'updated_at')
        return self.readonly_fields

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'part', 'quantity', 'price']
    search_fields = ['order__id', 'part__name']
    readonly_fields = ['order', 'part', 'quantity', 'price']