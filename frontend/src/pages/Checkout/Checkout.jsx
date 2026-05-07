import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import './Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const [userData, setUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: '',
    street: '',
    house: '',
    apartment: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Обработчики для добавления префиксов при потере фокуса
  const handleCityBlur = (e) => {
    let value = e.target.value;
    if (value && !value.startsWith('г. ')) {
      setUserData({ ...userData, city: `г. ${value}` });
    }
  };

  const handleStreetBlur = (e) => {
    let value = e.target.value;
    if (value && !value.startsWith('ул. ')) {
      setUserData({ ...userData, street: `ул. ${value}` });
    }
  };

  const handleHouseBlur = (e) => {
    let value = e.target.value;
    if (value && !value.startsWith('д. ')) {
      setUserData({ ...userData, house: `д. ${value}` });
    }
  };

  const handleApartmentBlur = (e) => {
    let value = e.target.value;
    if (value && !value.startsWith('кв. ')) {
      setUserData({ ...userData, apartment: `кв. ${value}` });
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      axios.get('http://127.0.0.1:8000/api/profile/', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(response => {
        const profile = response.data;
        setUserData({
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || '',
          phone: profile.profile?.phone || '',
          city: profile.profile?.city || '',
          street: profile.profile?.street || '',
          house: profile.profile?.house || '',
          apartment: profile.profile?.apartment || ''
        });
      }).catch(console.error);
    }
  }, []);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('Необходимо войти в аккаунт');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://127.0.0.1:8000/api/orders/', userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      clearCart();
      alert('Заказ успешно оформлен!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при оформлении заказа');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>Корзина пуста</h2>
        <p>Добавьте товары в корзину перед оформлением заказа.</p>
        <button onClick={() => navigate('/catalog')}>Перейти в каталог</button>
      </div>
    );
  }

  return (
    <div className="checkout">
      <h1>Оформление заказа</h1>
      <div className="checkout-grid">
        <div className="checkout-form">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <input name="first_name" placeholder="Имя" value={userData.first_name} onChange={handleChange} required />
              <input name="last_name" placeholder="Фамилия" value={userData.last_name} onChange={handleChange} required />
            </div>
            <input name="email" type="email" placeholder="Email" value={userData.email} onChange={handleChange} required />
            <input name="phone" placeholder="Телефон" value={userData.phone} onChange={handleChange} required />
            
            <input 
              name="city" 
              placeholder="Город" 
              value={userData.city} 
              onChange={handleChange} 
              onBlur={handleCityBlur}
              required 
            />
            <input 
              name="street" 
              placeholder="Улица" 
              value={userData.street} 
              onChange={handleChange} 
              onBlur={handleStreetBlur}
              required 
            />
            <div className="form-row">
              <input 
                name="house" 
                placeholder="Дом" 
                value={userData.house} 
                onChange={handleChange} 
                onBlur={handleHouseBlur}
                required 
              />
              <input 
                name="apartment" 
                placeholder="Квартира" 
                value={userData.apartment} 
                onChange={handleChange} 
                onBlur={handleApartmentBlur}
              />
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" disabled={loading}>{loading ? 'Оформление...' : 'Подтвердить заказ'}</button>
          </form>
        </div>
        <div className="checkout-summary">
          <h3>Ваш заказ</h3>
          {cartItems.map(item => (
            <div key={item.id} className="order-item">
              <span>{item.part?.name}</span>
              <span>{item.quantity} x {item.part?.price} BYN</span>
            </div>
          ))}
          <div className="total">Итого: {getTotalPrice().toFixed(2)} BYN</div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;