import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import './Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const [isForAnother, setIsForAnother] = useState(false);
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

  // Функции для добавления префиксов
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

  // Загрузка профиля
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
        // recipientData НЕ заполняем данными пользователя, оставляем пустым
      }).catch(console.error);
    }
  }, []);

  const handleUserChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleRecipientChange = (e) => {
    setRecipientData({ ...recipientData, [e.target.name]: e.target.value });
  };

  // Обработчик переключения чекбокса
  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setIsForAnother(isChecked);
    
    // При переключении НА другого человека - очищаем recipientData
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

    // Валидация: проверяем что поля не пустые
    if (!orderData.first_name || !orderData.last_name || !orderData.email || !orderData.phone || 
        !orderData.city || !orderData.street || !orderData.house) {
      setError('Пожалуйста, заполните все обязательные поля');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://127.0.0.1:8000/api/orders/', orderData, {
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

  // Текущие данные для отображения
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