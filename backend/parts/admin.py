from django.contrib import admin
from .models import Part, Review

@admin.register(Part)
class PartAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'price', 'stock', 'category')
    list_filter = ('category', 'manufacturer')
    search_fields = ('name', 'sku', 'description')
@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['author', 'part', 'rating', 'created_at']
    list_filter = ['part', 'rating']
    search_fields = ['author', 'text']