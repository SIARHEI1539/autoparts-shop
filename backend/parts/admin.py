from django.contrib import admin
from .models import Part

@admin.register(Part)
class PartAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'price', 'stock', 'category')
    list_filter = ('category', 'manufacturer')
    search_fields = ('name', 'sku', 'description')