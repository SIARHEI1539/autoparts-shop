import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Cart.css';

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice } = useCart();

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

  return (
    <div className="cart">
      <div className="cart-container">
        <h1>Корзина</h1>
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-info">
                <Link to={`/product/${item.id}`}>{item.name}</Link>
                <div className="cart-item-price">{item.price} BYN</div>
              </div>
              <div className="cart-item-quantity">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              </div>
              <div className="cart-item-total">
                {(item.price * item.quantity).toFixed(2)} BYN
              </div>
              <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>🗑️</button>
            </div>
          ))}
        </div>
        <div className="cart-summary">
          <h3>Итого: {getTotalPrice().toFixed(2)} BYN</h3>
          <button className="checkout-btn">Оформить заказ</button>
        </div>
      </div>
    </div>
  );
}

export default Cart;