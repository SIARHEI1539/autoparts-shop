from rest_framework import serializers
from .models import Part, Review, Cart, Favorite

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