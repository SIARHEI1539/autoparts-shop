from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['avatar', 'phone', 'city', 'street', 'house', 'apartment']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password_confirm = serializers.CharField(write_only=True, required=True)
    avatar = serializers.ImageField(write_only=True, required=False)
    phone = serializers.CharField(write_only=True, required=False)
    city = serializers.CharField(write_only=True, required=False)
    street = serializers.CharField(write_only=True, required=False)
    house = serializers.CharField(write_only=True, required=False)
    apartment = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'password', 'password_confirm', 'avatar', 'phone', 
                  'city', 'street', 'house', 'apartment']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError('Пароли не совпадают')
        return data

    def create(self, validated_data):
        avatar = validated_data.pop('avatar', None)
        phone = validated_data.pop('phone', '')
        city = validated_data.pop('city', '')
        street = validated_data.pop('street', '')
        house = validated_data.pop('house', '')
        apartment = validated_data.pop('apartment', '')
        validated_data.pop('password_confirm')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        UserProfile.objects.create(
            user=user,
            avatar=avatar,
            phone=phone,
            city=city,
            street=street,
            house=house,
            apartment=apartment
        )
        
        return user

class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile']