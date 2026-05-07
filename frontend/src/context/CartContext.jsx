import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('access_token');

  // ==================== КОРЗИНА ====================
  
  const loadCartFromServer = async () => {
    const token = getToken();
    console.log('🔄 Загрузка корзины с сервера, токен:', !!token);
    if (!token) return;

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/cart/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('📦 Корзина с сервера:', response.data);
      setCartItems(response.data);
      setLoading(false);
    } catch (error) {
      console.error('❌ Ошибка загрузки корзины:', error);
    }
  };

  const syncLocalCart = async (localCart) => {
    const token = getToken();
    console.log('🔄 Синхронизация локальной корзины:', localCart);
    if (!token || !localCart.length) return;

    for (const item of localCart) {
      try {
        await axios.post('http://127.0.0.1:8000/api/cart/', {
          part_id: item.id,
          quantity: item.quantity
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Товар ${item.id} синхронизирован`);
      } catch (error) {
        console.error('❌ Ошибка синхронизации:', error);
      }
    }
    await loadCartFromServer();
  };

  const addToCart = async (product, quantity = 1) => {
    const token = getToken();
    console.log('🛒 addToCart, товар:', product?.id, 'количество:', quantity, 'токен:', !!token);
    
    if (token) {
      try {
        await axios.post('http://127.0.0.1:8000/api/cart/', {
          part_id: product.id,
          quantity: quantity
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Товар добавлен на сервер');
        await loadCartFromServer();
      } catch (error) {
        console.error('❌ Ошибка добавления в корзину:', error);
      }
    } else {
      const existingItem = cartItems.find(item => item.part?.id === product.id);
      let newCart;
      if (existingItem) {
        newCart = cartItems.map(item =>
          item.part?.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [...cartItems, { part: product, quantity }];
      }
      setCartItems(newCart);
      localStorage.setItem('local_cart', JSON.stringify(newCart.map(item => ({
        id: item.part.id,
        quantity: item.quantity
      }))));
      console.log('📦 Товар добавлен в локальную корзину');
    }
  };

  const removeFromCart = async (productId) => {
    const token = getToken();
    console.log('🗑️ removeFromCart, productId:', productId, 'токен:', !!token);
    
    if (token) {
      try {
        const cartItemsList = await axios.get('http://127.0.0.1:8000/api/cart/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const itemToDelete = cartItemsList.data.find(item => item.part?.id === productId);
        if (itemToDelete) {
          await axios.delete(`http://127.0.0.1:8000/api/cart/${itemToDelete.id}/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('✅ Товар удалён с сервера');
        }
        await loadCartFromServer();
      } catch (error) {
        console.error('❌ Ошибка удаления:', error);
      }
    } else {
      setCartItems(cartItems.filter(item => item.part?.id !== productId));
      localStorage.setItem('local_cart', JSON.stringify(
        cartItems.filter(item => item.part?.id !== productId).map(item => ({
          id: item.part.id,
          quantity: item.quantity
        }))
      ));
      console.log('📦 Товар удалён из локальной корзины');
    }
  };

  const updateQuantity = async (productId, quantity) => {
    console.log('🔄 updateQuantity, productId:', productId, 'quantity:', quantity);
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const token = getToken();
    
    if (token) {
      try {
        const cartItemsList = await axios.get('http://127.0.0.1:8000/api/cart/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const existingItem = cartItemsList.data.find(item => item.part?.id === productId);
        
        if (existingItem) {
          await axios.post('http://127.0.0.1:8000/api/cart/', {
            part_id: productId,
            quantity: quantity
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('✅ Количество обновлено на сервере');
        } else {
          await addToCart({ id: productId }, quantity);
        }
        await loadCartFromServer();
      } catch (error) {
        console.error('❌ Ошибка обновления:', error);
      }
    } else {
      setCartItems(cartItems.map(item =>
        item.part?.id === productId ? { ...item, quantity } : item
      ));
      localStorage.setItem('local_cart', JSON.stringify(
        cartItems.map(item => ({
          id: item.part.id,
          quantity: item.quantity
        }))
      ));
      console.log('📦 Количество обновлено в локальной корзине');
    }
  };

  const clearCart = async () => {
    const token = getToken();
    console.log('🗑️ clearCart, токен:', !!token);
    
    if (token) {
      try {
        const items = await axios.get('http://127.0.0.1:8000/api/cart/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        for (const item of items.data) {
          await axios.delete(`http://127.0.0.1:8000/api/cart/${item.id}/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        await loadCartFromServer();
        console.log('✅ Корзина очищена на сервере');
      } catch (error) {
        console.error('❌ Ошибка очистки корзины:', error);
      }
    } else {
      setCartItems([]);
      localStorage.removeItem('local_cart');
      console.log('📦 Локальная корзина очищена');
    }
  };

  const getTotalCount = () => {
    return cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + parseFloat(item.part?.price || 0) * (item.quantity || 1), 0);
  };

  // ==================== ИЗБРАННОЕ ====================

  const loadFavoritesFromServer = async () => {
    const token = getToken();
    console.log('🔄 Загрузка избранного с сервера, токен:', !!token);
    
    if (!token) return;

    try {
      const response = await axios.get('http://127.0.0.1:8000/api/favorites/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('❤️ Избранное с сервера:', response.data);
      console.log('📊 Количество:', response.data.length);
      
      setFavorites(response.data);
      const favoriteIds = response.data.map(f => f.part.id);
      localStorage.setItem('favorites', JSON.stringify(favoriteIds));
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (error) {
      console.error('❌ Ошибка загрузки избранного:', error);
    }
  };

  const syncLocalFavorites = async (localFavorites) => {
    const token = getToken();
    console.log('🔄 Синхронизация локального избранного:', localFavorites);
    
    if (!token || !localFavorites.length) return;

    for (const partId of localFavorites) {
      try {
        await axios.post('http://127.0.0.1:8000/api/favorites/', {
          part_id: partId
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`❤️ Товар ${partId} синхронизирован в избранное`);
      } catch (error) {
        console.error('❌ Ошибка синхронизации избранного:', error);
      }
    }
    await loadFavoritesFromServer();
  };

  const toggleFavorite = async (productId) => {
    console.log('❤️ toggleFavorite в контексте, productId:', productId);
    const token = getToken();
    console.log('🔑 Токен:', !!token);
  
    if (!token) return false;

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/favorites/', {
        part_id: productId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    
      console.log('📡 Ответ сервера:', response.status);
    
      await loadFavoritesFromServer();
      
      window.dispatchEvent(new Event('favoritesUpdated'));
      
      return true;
    } catch (error) {
      console.error('❌ Ошибка изменения избранного:', error.response?.data || error);
      return false;
    }
  };

  const getFavoritesCount = () => {
    const token = getToken();
    if (token) {
      return favorites.length;
    }
    return JSON.parse(localStorage.getItem('favorites') || '[]').length;
  };

  useEffect(() => {
    const token = getToken();
    console.log('🚀 CartProvider инициализация, токен:', !!token);
    
    if (token) {
      loadCartFromServer();
      loadFavoritesFromServer();
    } else {
      const localCart = localStorage.getItem('local_cart');
      if (localCart) {
        try {
          const parsed = JSON.parse(localCart);
          console.log('📦 Локальная корзина загружена:', parsed);
          setCartItems([]);
        } catch (e) {
          console.error('❌ Ошибка парсинга локальной корзины:', e);
        }
      }
      
      const localFavs = localStorage.getItem('favorites');
      if (localFavs) {
        console.log('❤️ Локальное избранное загружено:', localFavs);
        setFavorites(JSON.parse(localFavs).map(id => ({ part: { id } })));
      }
    }
  }, []);

  return (
    <CartContext.Provider value={{
      cartItems,
      favorites,
      loading,
      
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalCount,
      getTotalPrice,
      loadCartFromServer,
      syncLocalCart,
      
      loadFavoritesFromServer,
      syncLocalFavorites,
      toggleFavorite,
      getFavoritesCount
    }}>
      {children}
    </CartContext.Provider>
  );
}