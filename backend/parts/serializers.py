from rest_framework import serializers
from .models import Part, Review, Cart, Favorite, Order, OrderItem

class PartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Part
        fields = '__all__'


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['id', 'part', 'author', 'rating', 'text', 'created_at']


class CartSerializer(serializers.ModelSerializer):
    part = PartSerializer(read_only=True)
    part_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'part', 'part_id', 'quantity']
        read_only_fields = ['user']


class FavoriteSerializer(serializers.ModelSerializer):
    part = PartSerializer(read_only=True)
    part_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'user', 'part', 'part_id']
        read_only_fields = ['user']

class OrderItemSerializer(serializers.ModelSerializer):
    part_name = serializers.CharField(source='part.name', read_only=True)
    part_price = serializers.DecimalField(source='part.price', read_only=True, max_digits=10, decimal_places=2)

    class Meta:
        model = OrderItem
        fields = ['id', 'part', 'part_name', 'quantity', 'price', 'part_price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at', 'total_price']