import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProfileModal.css';

function ProfileModal({ isOpen, onClose, user, onUpdate }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    city: '',
    street: '',
    house: '',
    apartment: '',
    avatar: null
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
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
      setMessage('❌ Ошибка при обновлении');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="profile-modal-close" onClick={onClose}>×</button>
        
        <h2>Мой профиль</h2>
        <p className="profile-username">@{user?.username}</p>
        
        {message && <div className={`profile-message ${message.includes('Ошибка') ? 'error' : 'success'}`}>{message}</div>}
        
        <form onSubmit={handleSubmit}>
          {/* Фото профиля */}
          <div className="avatar-row">
            <div className="avatar-label">Фото профиля</div>
            <div className="avatar-input-wrapper">
              <input type="file" accept="image/*" onChange={handleAvatarChange} id="avatar-input" />
              <label htmlFor="avatar-input" className="avatar-btn">Выбрать фото</label>
            </div>
            {avatarPreview && (
              <div className="avatar-preview">
                <img src={avatarPreview} alt="Avatar" />
              </div>
            )}
          </div>
          
          {/* Имя и фамилия */}
          <div className="form-row">
            <div className="form-group">
              <label>Имя</label>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Фамилия</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} />
            </div>
          </div>
          
          {/* Email */}
          <div className="form-group full">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} />
          </div>
          
          {/* Адрес доставки */}
          <div className="address-block">
            <div className="address-title">Адрес доставки</div>
            <div className="form-group">
              <input type="text" name="city" placeholder="Город" value={formData.city} onChange={handleChange} />
            </div>
            <div className="form-group">
              <input type="text" name="street" placeholder="Улица" value={formData.street} onChange={handleChange} />
            </div>
            <div className="form-row-small">
              <div className="form-group half">
                <input type="text" name="house" placeholder="Дом" value={formData.house} onChange={handleChange} />
              </div>
              <div className="form-group half">
                <input type="text" name="apartment" placeholder="Квартира" value={formData.apartment} onChange={handleChange} />
              </div>
            </div>
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileModal;