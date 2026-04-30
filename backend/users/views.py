from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer
from .models import UserProfile

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)
        user.email = request.data.get('email', user.email)
        user.save()
        
        # Обновляем профиль
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.city = request.data.get('city', profile.city)
        profile.street = request.data.get('street', profile.street)
        profile.house = request.data.get('house', profile.house)
        profile.apartment = request.data.get('apartment', profile.apartment)
        
        # Обновляем фото если есть
        if 'avatar' in request.FILES:
            profile.avatar = request.FILES['avatar']
        
        profile.save()
        
        serializer = UserSerializer(user)
        return Response(serializer.data)