import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import './Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const [isForAnother, setIsForAnother] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
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
  const [recipientData, setRecipientData] = useState({
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

  const addPrefix = (value, prefix) => {
    if (value && !value.startsWith(prefix)) {
      return `${prefix} ${value}`;
    }
    return value;
  };

  const handleCityBlur = (setter, data) => (e) => {
    const value = addPrefix(e.target.value, 'г.');
    setter({ ...data, city: value });
  };

  const handleStreetBlur = (setter, data) => (e) => {
    const value = addPrefix(e.target.value, 'ул.');
    setter({ ...data, street: value });
  };

  const handleHouseBlur = (setter, data) => (e) => {
    const value = addPrefix(e.target.value, 'д.');
    setter({ ...data, house: value });
  };

  const handleApartmentBlur = (setter, data) => (e) => {
    const value = addPrefix(e.target.value, 'кв.');
    setter({ ...data, apartment: value });
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      axios.get('http://127.0.0.1:8000/api/profile/', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(response => {
        const profile = response.data;
        const userInfo = {
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || '',
          phone: profile.profile?.phone || '',
          city: profile.profile?.city || '',
          street: profile.profile?.street || '',
          house: profile.profile?.house || '',
          apartment: profile.profile?.apartment || ''
        };
        setUserData(userInfo);
      }).catch(console.error);
    }
  }, []);

  const handleUserChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleRecipientChange = (e) => {
    setRecipientData({ ...recipientData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setIsForAnother(isChecked);
    
    if (isChecked) {
      setRecipientData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        city: '',
        street: '',
        house: '',
        apartment: ''
      });
    }
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

    const orderData = isForAnother ? recipientData : userData;

    if (!orderData.first_name || !orderData.last_name || !orderData.email || !orderData.phone || 
        !orderData.city || !orderData.street || !orderData.house) {
      setError('Пожалуйста, заполните все обязательные поля');
      setLoading(false);
      return;
    }

    try {
      // Добавляем способ оплаты в данные заказа
      const orderPayload = {
        ...orderData,
        payment_method: paymentMethod
      };
      
      const orderResponse = await axios.post('http://127.0.0.1:8000/api/orders/', orderPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const order = orderResponse.data;
      
      if (paymentMethod === 'card') {
        // Для карты заказ уже оплачен в тестовом режиме на бэкенде
        alert(`✅ Заказ №${order.id} успешно оформлен и ОПЛАЧЕН (тестовый режим)!`);
      } else if (paymentMethod === 'cash') {
        alert(`✅ Заказ №${order.id} успешно оформлен! Оплата при получении.`);
      }
      
      clearCart();
      navigate('/orders');
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

  const currentData = isForAnother ? recipientData : userData;
  const handleChange = isForAnother ? handleRecipientChange : handleUserChange;
  const cityBlur = isForAnother ? handleCityBlur(setRecipientData, recipientData) : handleCityBlur(setUserData, userData);
  const streetBlur = isForAnother ? handleStreetBlur(setRecipientData, recipientData) : handleStreetBlur(setUserData, userData);
  const houseBlur = isForAnother ? handleHouseBlur(setRecipientData, recipientData) : handleHouseBlur(setUserData, userData);
  const apartmentBlur = isForAnother ? handleApartmentBlur(setRecipientData, recipientData) : handleApartmentBlur(setUserData, userData);

  return (
    <div className="checkout">
      <h1>Оформление заказа</h1>
      <div className="checkout-grid">
        <div className="checkout-form">
          <form onSubmit={handleSubmit}>
            <div className="another-person-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={isForAnother}
                  onChange={handleCheckboxChange}
                />
                Оформить заказ на другого человека
              </label>
            </div>

            <h3>{isForAnother ? 'Данные получателя' : 'Ваши данные'}</h3>
            
            <div className="form-row">
              <input 
                name="first_name" 
                placeholder={isForAnother ? "Имя получателя" : "Имя"} 
                value={currentData.first_name} 
                onChange={handleChange} 
                required 
              />
              <input 
                name="last_name" 
                placeholder={isForAnother ? "Фамилия получателя" : "Фамилия"} 
                value={currentData.last_name} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            <input 
              name="email" 
              type="email" 
              placeholder={isForAnother ? "Email получателя" : "Email"} 
              value={currentData.email} 
              onChange={handleChange} 
              required 
            />
            
            <input 
              name="phone" 
              placeholder={isForAnother ? "Телефон получателя" : "Телефон"} 
              value={currentData.phone} 
              onChange={handleChange} 
              required 
            />
            
            <input 
              name="city" 
              placeholder={isForAnother ? "Город получателя" : "Город"} 
              value={currentData.city} 
              onChange={handleChange} 
              onBlur={cityBlur} 
              required 
            />
            
            <input 
              name="street" 
              placeholder={isForAnother ? "Улица получателя" : "Улица"} 
              value={currentData.street} 
              onChange={handleChange} 
              onBlur={streetBlur} 
              required 
            />
            
            <div className="form-row">
              <input 
                name="house" 
                placeholder={isForAnother ? "Дом получателя" : "Дом"} 
                value={currentData.house} 
                onChange={handleChange} 
                onBlur={houseBlur} 
                required 
              />
              <input 
                name="apartment" 
                placeholder={isForAnother ? "Квартира получателя" : "Квартира"} 
                value={currentData.apartment} 
                onChange={handleChange} 
                onBlur={apartmentBlur} 
              />
            </div>

            <div className="payment-methods">
              <h3>Способ оплаты</h3>
              <label className="payment-option">
                <input 
                  type="radio" 
                  value="cash" 
                  checked={paymentMethod === 'cash'} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>💵 Наличными при получении</span>
              </label>
              <label className="payment-option">
                <input 
                  type="radio" 
                  value="card" 
                  checked={paymentMethod === 'card'} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>💳 Банковской картой онлайн (тестовый режим)</span>
              </label>
            </div>
            
            {error && <div className="error">{error}</div>}
            
            <button type="submit" disabled={loading}>
              {loading ? 'Оформление...' : `Подтвердить заказ на ${getTotalPrice().toFixed(2)} BYN`}
            </button>
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