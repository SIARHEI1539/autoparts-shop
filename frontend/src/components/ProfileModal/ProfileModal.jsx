import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfileModal.css';

function ProfileModal({ isOpen, onClose, user, onUpdate }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    city: '',
    street: '',
    house: '',
    apartment: '',
    avatar: null
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Состояния для смены пароля
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.profile?.phone || '',
        city: user.profile?.city || '',
        street: user.profile?.street || '',
        house: user.profile?.house || '',
        apartment: user.profile?.apartment || '',
        avatar: null
      });
      if (user.profile?.avatar) {
        setAvatarPreview(`http://127.0.0.1:8000${user.profile.avatar}`);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage('');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setMessage('');
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
    setMessage('');

    try {
      const token = localStorage.getItem('access_token');
      const submitData = new FormData();
      submitData.append('first_name', formData.first_name);
      submitData.append('last_name', formData.last_name);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('city', formData.city);
      submitData.append('street', formData.street);
      submitData.append('house', formData.house);
      submitData.append('apartment', formData.apartment);
      if (formData.avatar) {
        submitData.append('avatar', formData.avatar);
      }
      
      const response = await axios.put(
        'http://127.0.0.1:8000/api/profile/',
        submitData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );
      
      localStorage.setItem('user', JSON.stringify(response.data));
      onUpdate(response.data);
      
      setMessage('✅ Данные обновлены!');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage('❌ Ошибка при обновлении данных');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setMessage('❌ Новые пароли не совпадают');
      return;
    }
    
    if (passwordData.new_password.length < 6) {
      setMessage('❌ Пароль должен содержать минимум 6 символов');
      return;
    }

    setPasswordLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        'http://127.0.0.1:8000/api/change-password/',
        {
          old_password: passwordData.old_password,
          new_password: passwordData.new_password
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('✅ Пароль успешно изменён!');
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      setShowPasswordForm(false);
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      setMessage(error.response?.data?.error || '❌ Неверный старый пароль');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="profile-modal-close" onClick={onClose}>×</button>
        
        <h2>Мой профиль</h2>
        <p className="profile-username">@{user?.username}</p>
        
        {message && <div className={`profile-message ${message.includes('❌') ? 'error' : 'success'}`}>{message}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="avatar-section">
            <div className="avatar-label">Фото профиля</div>
            <input type="file" accept="image/*" onChange={handleAvatarChange} id="avatar-input" />
            <label htmlFor="avatar-input" className="avatar-btn">Выбрать фото</label>
            {avatarPreview && (
              <div className="avatar-preview">
                <img src={avatarPreview} alt="Avatar" />
              </div>
            )}
          </div>
          
          <div className="row">
            <div className="form-group half">
              <label>Имя</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} />
            </div>
            <div className="form-group half">
              <label>Фамилия</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} />
            </div>
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} />
          </div>
          
          <div className="form-group">
            <label>Телефон</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+375XXXXXXXXX" />
          </div>
          
          <div className="address-block">
            <div className="address-title">📍 Адрес доставки</div>
            <input type="text" name="city" placeholder="Город" value={formData.city} onChange={handleChange} />
            <input type="text" name="street" placeholder="Улица" value={formData.street} onChange={handleChange} />
            <div className="row">
              <input type="text" name="house" placeholder="Дом" value={formData.house} onChange={handleChange} />
              <input type="text" name="apartment" placeholder="Кв./офис" value={formData.apartment} onChange={handleChange} />
            </div>
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </form>

        {/* Блок смены пароля */}
        <div className="password-change-section">
          <button 
            type="button" 
            className="change-password-btn"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            {showPasswordForm ? '− Скрыть форму смены пароля' : '+ Сменить пароль'}
          </button>
          
          {showPasswordForm && (
            <form onSubmit={handlePasswordSubmit} className="password-form">
              <div className="password-field">
                <input 
                  type={showOldPassword ? "text" : "password"} 
                  name="old_password" 
                  placeholder="Старый пароль" 
                  value={passwordData.old_password} 
                  onChange={handlePasswordChange} 
                  required 
                />
                <button type="button" className="toggle-password" onClick={() => setShowOldPassword(!showOldPassword)}>
                  {showOldPassword ? '🙈' : '👁️'}
                </button>
              </div>
              
              <div className="password-field">
                <input 
                  type={showNewPassword ? "text" : "password"} 
                  name="new_password" 
                  placeholder="Новый пароль" 
                  value={passwordData.new_password} 
                  onChange={handlePasswordChange} 
                  required 
                />
                <button type="button" className="toggle-password" onClick={() => setShowNewPassword(!showNewPassword)}>
                  {showNewPassword ? '🙈' : '👁️'}
                </button>
              </div>
              
              <div className="password-field">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirm_password" 
                  placeholder="Подтвердите новый пароль" 
                  value={passwordData.confirm_password} 
                  onChange={handlePasswordChange} 
                  required 
                />
                <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              
              <button type="submit" disabled={passwordLoading}>
                {passwordLoading ? 'Изменение...' : 'Изменить пароль'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileModal;