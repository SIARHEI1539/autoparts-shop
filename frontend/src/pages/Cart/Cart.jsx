import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Cart.css';

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCart();

  console.log('🛒 Корзина загружена:', cartItems);

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-cart-icon">🛒</div>
        <h2>Корзина пуста</h2>
        <p>Добавьте товары в корзину, и они появятся здесь.</p>
        <Link to="/catalog" className="empty-cart-btn">Перейти в каталог</Link>
      </div>
    );
  }

  const totalPrice = getTotalPrice();
  console.log('💰 Общая сумма:', totalPrice);

  return (
    <div className="cart">
      <div className="cart-container">
        <h1>Корзина</h1>
        <div className="cart-grid">
          <div className="cart-items">
            {cartItems.map(item => {
              const price = parseFloat(item.part?.price) || 0;
              const quantity = item.quantity || 1;
              const totalItemPrice = price * quantity;
              
              return (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    {item.part?.image ? (
                      <img src={item.part.image} alt={item.part.name} />
                    ) : (
                      <div className="no-image">🛞</div>
                    )}
                  </div>
                  
                  <div className="cart-item-info">
                    <Link to={`/product/${item.part?.id}`} className="cart-item-title">
                      {item.part?.name || 'Товар'}
                    </Link>
                    <p className="cart-item-price">{price.toFixed(2)} BYN</p>
                  </div>
                  
                  <div className="cart-item-quantity">
                    <button onClick={() => updateQuantity(item.part?.id, quantity - 1)}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => updateQuantity(item.part?.id, quantity + 1)}>+</button>
                  </div>
                  
                  <div className="cart-item-total">
                    {totalItemPrice.toFixed(2)} BYN
                  </div>
                  
                  <button 
                    className="cart-item-remove"
                    onClick={() => removeFromCart(item.part?.id)}
                  >
                    🗑️
                  </button>
                </div>
              );
            })}
          </div>
          
          <div className="cart-summary">
            <h3>Итого</h3>
            <div className="summary-row">
              <span>Товаров:</span>
              <span>{cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)} шт.</span>
            </div>
            <div className="summary-row total">
              <span>Сумма:</span>
              <span>{totalPrice.toFixed(2)} BYN</span>
            </div>
            <Link to="/checkout" className="checkout-btn">Оформить заказ</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;