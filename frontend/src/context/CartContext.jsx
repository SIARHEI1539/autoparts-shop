import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

const CartContext = createContext();

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const isFirstRender = useRef(true); // ← флаг первого рендера

  // Загрузка из localStorage ТОЛЬКО ПРИ ПЕРВОМ РЕНДЕРЕ
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      const loadCart = () => {
        const savedCart = localStorage.getItem('cart');
        console.log('Raw from localStorage on load:', savedCart);
        
        if (savedCart) {
          try {
            const parsed = JSON.parse(savedCart);
            console.log('Parsed cart:', parsed);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCartItems(parsed);
              return;
            }
          } catch (e) {
            console.error('Ошибка парсинга корзины:', e);
            localStorage.removeItem('cart');
          }
        }
        setCartItems([]);
      };
      
      loadCart();
    }
  }, []);

  // Сохранение в localStorage ПРИ КАЖДОМ ИЗМЕНЕНИИ
  useEffect(() => {
    // Не сохраняем, если это первый рендер и корзина пустая
    if (isFirstRender.current) {
      return;
    }
    console.log('Saving to localStorage:', cartItems);
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

 const getTotalCount = () => {
  return cartItems.reduce((sum, item) => sum + item.quantity, 0);
};

  const getTotalPrice = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalCount,
      getTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
}