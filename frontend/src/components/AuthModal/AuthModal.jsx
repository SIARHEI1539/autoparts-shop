import React, { useState } from 'react';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import './AuthModal.css';

function AuthModal({ isOpen, onClose, onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
    street: '',
    house: '',
    apartment: '',
    avatar: null
  });
  const [validationErrors, setValidationErrors] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const { syncLocalCart, loadCartFromServer, loadFavoritesFromServer, syncLocalFavorites } = useCart();

  // Валидация
  const validateUsername = (username) => {
    if (!username) return 'Логин обязателен';
    if (username.length < 3) return 'Логин должен содержать минимум 3 символа';
    return '';
  };

  const validateEmail = (email) => {
    if (!email) return 'Email обязателен';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Введите корректный email';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Пароль обязателен';
    if (password.length < 8) return 'Пароль должен содержать минимум 8 символов';
    if (!/[0-9]/.test(password)) return 'Пароль должен содержать хотя бы одну цифру';
    return '';
  };

  const validatePasswordConfirm = (password, confirm) => {
    if (isLogin) return '';
    if (!confirm) return 'Подтвердите пароль';
    if (password !== confirm) return 'Пароли не совпадают';
    return '';
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, username: value });
    setValidationErrors({ ...validationErrors, username: validateUsername(value) });
    setError('');
    setSuccess('');
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });
    setValidationErrors({ ...validationErrors, email: validateEmail(value) });
    setError('');
    setSuccess('');
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, password: value });
    setValidationErrors({ 
      ...validationErrors, 
      password: validatePassword(value),
      password_confirm: validatePasswordConfirm(value, formData.password_confirm)
    });
    setError('');
    setSuccess('');
  };

  const handlePasswordConfirmChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, password_confirm: value });
    setValidationErrors({ 
      ...validationErrors, 
      password_confirm: validatePasswordConfirm(formData.password, value)
    });
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleCityBlur = (e) => {
    let value = e.target.value;
    if (value && !value.startsWith('г. ')) {
      setFormData({ ...formData, city: `г. ${value}` });
    }
  };

  const handleStreetBlur = (e) => {
    let value = e.target.value;
    if (value && !value.startsWith('ул. ')) {
      setFormData({ ...formData, street: `ул. ${value}` });
    }
  };

  const handleHouseBlur = (e) => {
    let value = e.target.value;
    if (value && !value.startsWith('д. ')) {
      setFormData({ ...formData, house: `д. ${value}` });
    }
  };

  const handleApartmentBlur = (e) => {
    let value = e.target.value;
    if (value && !value.startsWith('кв. ')) {
      setFormData({ ...formData, apartment: `кв. ${value}` });
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, avatar: file });
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const isFormValid = () => {
    if (isLogin) {
      return formData.username && formData.password && !validationErrors.username && !validationErrors.password;
    } else {
      return formData.username && formData.email && formData.password && formData.password_confirm &&
        !validationErrors.username && !validationErrors.email && !validationErrors.password && !validationErrors.password_confirm;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLogin) {
      const emailError = validateEmail(formData.email);
      const passwordError = validatePassword(formData.password);
      const passwordConfirmError = validatePasswordConfirm(formData.password, formData.password_confirm);
      
      if (emailError || passwordError || passwordConfirmError) {
        setValidationErrors({ 
          ...validationErrors, 
          email: emailError,
          password: passwordError,
          password_confirm: passwordConfirmError
        });
        setError('Пожалуйста, исправьте ошибки в форме');
        setSuccess('');
        return;
      }
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const response = await axios.post('http://127.0.0.1:8000/api/token/', {
          username: formData.username,
          password: formData.password
        });
        
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh);
        
        const localCart = localStorage.getItem('local_cart');
        if (localCart) {
          await syncLocalCart(JSON.parse(localCart));
          localStorage.removeItem('local_cart');
        }
        
        const localFavorites = localStorage.getItem('local_favorites');
        if (localFavorites) {
          await syncLocalFavorites(JSON.parse(localFavorites));
          localStorage.removeItem('local_favorites');
        }
        
        await loadCartFromServer();
        await loadFavoritesFromServer();
        
        const profileResponse = await axios.get('http://127.0.0.1:8000/api/profile/', {
          headers: { Authorization: `Bearer ${response.data.access}` }
        });
        
        localStorage.setItem('user', JSON.stringify(profileResponse.data));
        
        window.dispatchEvent(new Event('favoritesUpdated'));
        
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
        submitData.append('phone', formData.phone || '');
        submitData.append('city', formData.city || '');
        submitData.append('street', formData.street || '');
        submitData.append('house', formData.house || '');
        submitData.append('apartment', formData.apartment || '');
        if (formData.avatar) {
          submitData.append('avatar', formData.avatar);
        }
        
        await axios.post('http://127.0.0.1:8000/api/register/', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        setIsLogin(true);
        setFormData({
          username: '', email: '', password: '', password_confirm: '',
          first_name: '', last_name: '', phone: '', city: '', street: '', house: '', apartment: '', avatar: null
        });
        setValidationErrors({
          username: '',
          email: '',
          password: '',
          password_confirm: ''
        });
        setAvatarPreview(null);
        setSuccess('✅ Регистрация прошла успешно! Теперь войдите.');
        setError('');
      }
    } catch (err) {
      console.error('Ошибка:', err.response?.data);
      if (err.response?.data?.username) {
        setError('❌ Пользователь с таким логином уже существует');
      } else if (err.response?.data?.email) {
        setError('❌ Пользователь с таким email уже существует');
      } else {
        setError(err.response?.data?.detail || '❌ Произошла ошибка при регистрации');
      }
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>×</button>
        <h2>{isLogin ? 'Вход' : 'Регистрация'}</h2>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <input 
              type="text" 
              name="username" 
              placeholder="Логин" 
              value={formData.username} 
              onChange={handleUsernameChange}
              required 
            />
            {validationErrors.username && <div className="field-error">{validationErrors.username}</div>}
          </div>
          
          {!isLogin ? (
            <>
              <div className="form-section">
                <div className="section-title">Основные данные</div>
                
                <div className="form-field">
                  <input 
                    type="email" 
                    name="email" 
                    placeholder="Email" 
                    value={formData.email} 
                    onChange={handleEmailChange}
                    required 
                  />
                  {validationErrors.email && <div className="field-error">{validationErrors.email}</div>}
                </div>
                
                <div className="row">
                  <input type="text" name="first_name" placeholder="Имя" value={formData.first_name} onChange={handleChange} />
                  <input type="text" name="last_name" placeholder="Фамилия" value={formData.last_name} onChange={handleChange} />
                </div>
                <input 
                  type="tel" 
                  name="phone" 
                  placeholder="Телефон (375XXXXXXXXX)" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-section">
                <div className="section-title">Адрес доставки</div>
                <input 
                  type="text" 
                  name="city" 
                  placeholder="Город" 
                  value={formData.city} 
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  onBlur={handleCityBlur}
                />
                <input 
                  type="text" 
                  name="street" 
                  placeholder="Улица" 
                  value={formData.street} 
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  onBlur={handleStreetBlur}
                />
                <div className="row">
                  <input 
                    type="text" 
                    name="house" 
                    placeholder="Дом" 
                    value={formData.house} 
                    onChange={(e) => setFormData({ ...formData, house: e.target.value })}
                    onBlur={handleHouseBlur}
                  />
                  <input 
                    type="text" 
                    name="apartment" 
                    placeholder="Кв." 
                    value={formData.apartment} 
                    onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                    onBlur={handleApartmentBlur}
                  />
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
          
          <div className="form-field password-field">
            <input 
              type={showPassword ? "text" : "password"} 
              name="password" 
              placeholder="Пароль" 
              value={formData.password} 
              onChange={handlePasswordChange}
              required 
            />
            <button type="button" className="toggle-password" onClick={toggleShowPassword}>
              {showPassword ? '🙈' : '👁️'}
            </button>
            {validationErrors.password && <div className="field-error">{validationErrors.password}</div>}
          </div>
          
          {!isLogin && (
            <div className="form-field password-field">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                name="password_confirm" 
                placeholder="Подтвердите пароль" 
                value={formData.password_confirm} 
                onChange={handlePasswordConfirmChange}
                required 
              />
              <button type="button" className="toggle-password" onClick={toggleShowConfirmPassword}>
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
              {validationErrors.password_confirm && <div className="field-error">{validationErrors.password_confirm}</div>}
            </div>
          )}
          
          <button type="submit" disabled={loading || !isFormValid()}>
            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>
        
        <div className="auth-switch">
          {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
          <button onClick={() => {
            setIsLogin(!isLogin);
            setError('');
            setSuccess('');
          }}>{isLogin ? 'Зарегистрироваться' : 'Войти'}</button>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;