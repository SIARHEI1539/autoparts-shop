from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Part, Review, Cart, Favorite, Order, OrderItem
from .serializers import PartSerializer, ReviewSerializer, CartSerializer, FavoriteSerializer, OrderSerializer

class PartViewSet(viewsets.ModelViewSet):
    queryset = Part.objects.all()
    serializer_class = PartSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['category']
    ordering_fields = ['name', 'price', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        
        if search:
            # Регистронезависимый поиск
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(manufacturer__icontains=search) |
                Q(sku__icontains=search)
            )
        
        return queryset

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['part']

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        part_id = request.data.get('part_id')
        quantity = request.data.get('quantity', 1)
        
        cart_item, created = Cart.objects.get_or_create(
            user=request.user,
            part_id=part_id,
            defaults={'quantity': quantity}
        )
        if not created:
            cart_item.quantity = quantity
            cart_item.save()
        
        serializer = self.get_serializer(cart_item)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        part_id = request.data.get('part_id')
        
        favorite, created = Favorite.objects.get_or_create(
            user=request.user,
            part_id=part_id
        )
        if not created:
            favorite.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        
        serializer = self.get_serializer(favorite)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)
    

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        user = request.user
        cart_items = Cart.objects.filter(user=user)

        if not cart_items.exists():
            return Response({'error': 'Корзина пуста'}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data
        total = 0

        order = Order.objects.create(
            user=user,
            first_name=data.get('first_name', user.first_name),
            last_name=data.get('last_name', user.last_name),
            email=data.get('email', user.email),
            phone=data.get('phone', ''),
            city=data.get('city', ''),
            street=data.get('street', ''),
            house=data.get('house', ''),
            apartment=data.get('apartment', ''),
            total_price=0
        )

        for cart_item in cart_items:
            part = cart_item.part
            price = float(part.price)
            total += price * cart_item.quantity

            OrderItem.objects.create(
                order=order,
                part=part,
                quantity=cart_item.quantity,
                price=price
            )

        order.total_price = total
        order.save()

        # Очищаем корзину
        cart_items.delete()

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)