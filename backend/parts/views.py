import time
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Part, Review, Cart, Favorite, Order, OrderItem
from .serializers import PartSerializer, ReviewSerializer, CartSerializer, FavoriteSerializer, OrderSerializer, OrderDetailSerializer


class PartPagination(PageNumberPagination):
    page_size = 3
    page_size_query_param = 'page_size'
    max_page_size = 100


class PartViewSet(viewsets.ModelViewSet):
    queryset = Part.objects.all()
    serializer_class = PartSerializer
    pagination_class = PartPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['category', 'manufacturer']
    ordering_fields = ['name', 'price', 'created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        in_stock = self.request.query_params.get('in_stock', None)
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(manufacturer__icontains=search) |
                Q(sku__icontains=search)
            )

        if in_stock == 'true':
            queryset = queryset.filter(stock__gt=0)
        
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
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['delete'])
    def clear_all(self, request):
        deleted_count, _ = Order.objects.filter(user=request.user).delete()
        return Response({'message': f'Удалено {deleted_count} заказов'}, status=status.HTTP_200_OK)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = OrderDetailSerializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def pay(self, request, pk=None):
        order = self.get_object()
        
        if order.paid:
            return Response({'error': 'Заказ уже оплачен'}, status=status.HTTP_400_BAD_REQUEST)
        
        payment_method = request.data.get('payment_method', 'card')
        
        order.paid = True
        order.status = 'paid'
        order.payment_method = payment_method
        order.payment_id = f"TEST_{order.id}_{int(time.time())}"
        order.save()
        
        return Response({
            'message': 'Оплата прошла успешно (тестовый режим)',
            'order_id': order.id,
            'payment_id': order.payment_id,
            'status': order.status
        })

    def create(self, request, *args, **kwargs):
        user = request.user
        cart_items = Cart.objects.filter(user=user)

        if not cart_items.exists():
            return Response({'error': 'Корзина пуста'}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data
        total = 0

        payment_method = data.get('payment_method', 'cash')
        
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
            payment_method=payment_method,
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

        if payment_method == 'card':
            order.paid = True
            order.status = 'paid'
            order.payment_id = f"TEST_{order.id}_{int(time.time())}"
            order.save()

        cart_items.delete()

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)