import React, { useState } from 'react';
import axios from 'axios';
import './AuthModal.css';

function AuthModal({ isOpen, onClose, onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    city: '',
    street: '',
    house: '',
    apartment: '',
    avatar: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, avatar: file });
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const response = await axios.post('http://127.0.0.1:8000/api/token/', {
          username: formData.username,
          password: formData.password
        });
        
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        
        const profileResponse = await axios.get('http://127.0.0.1:8000/api/profile/', {
          headers: { Authorization: `Bearer ${response.data.access}` }
        });
        
        localStorage.setItem('user', JSON.stringify(profileResponse.data));
        onLogin(profileResponse.data);
        onClose();
      } else {
        if (formData.password !== formData.password_confirm) {
          setError('Пароли не совпадают');
          setLoading(false);
          return;
        }
        
        const submitData = new FormData();
        submitData.append('username', formData.username);
        submitData.append('email', formData.email);
        submitData.append('password', formData.password);
        submitData.append('password_confirm', formData.password_confirm);
        submitData.append('first_name', formData.first_name);
        submitData.append('last_name', formData.last_name);
        submitData.append('city', formData.city);
        submitData.append('street', formData.street);
        submitData.append('house', formData.house);
        submitData.append('apartment', formData.apartment);
        if (formData.avatar) {
          submitData.append('avatar', formData.avatar);
        }
        
        await axios.post('http://127.0.0.1:8000/api/register/', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        setIsLogin(true);
        setFormData({
          username: '', email: '', password: '', password_confirm: '',
          first_name: '', last_name: '', city: '', street: '', house: '', apartment: '', avatar: null
        });
        setAvatarPreview(null);
        setError('Регистрация прошла успешно! Теперь войдите.');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>×</button>
        <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <input type="text" name="username" placeholder="Логин" value={formData.username} onChange={handleChange} required />
          
          {!isLogin ? (
            <>
              <div className="form-section">
                <div className="section-title">Основные данные</div>
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                <div className="row">
                  <input type="text" name="first_name" placeholder="Имя" value={formData.first_name} onChange={handleChange} />
                  <input type="text" name="last_name" placeholder="Фамилия" value={formData.last_name} onChange={handleChange} />
                </div>
              </div>

              <div className="form-section">
                <div className="section-title">Адрес доставки</div>
                <input type="text" name="city" placeholder="Город" value={formData.city} onChange={handleChange} />
                <input type="text" name="street" placeholder="Улица" value={formData.street} onChange={handleChange} />
                <div className="row">
                  <input type="text" name="house" placeholder="Дом" value={formData.house} onChange={handleChange} />
                  <input type="text" name="apartment" placeholder="Кв." value={formData.apartment} onChange={handleChange} />
                </div>
              </div>

              <div className="form-section">
                <div className="section-title">Фото профиля</div>
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
                {avatarPreview && (
                  <div className="avatar-preview">
                    <img src={avatarPreview} alt="Preview" />
                  </div>
                )}
              </div>
            </>
          ) : null}
          
          <input type="password" name="password" placeholder="Пароль" value={formData.password} onChange={handleChange} required />
          {!isLogin && <input type="password" name="password_confirm" placeholder="Подтвердите пароль" value={formData.password_confirm} onChange={handleChange} required />}
          
          <button type="submit" disabled={loading}>{loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}</button>
        </form>
        
        <div className="auth-switch">
          {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
          <button onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Зарегистрироваться' : 'Войти'}</button>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;