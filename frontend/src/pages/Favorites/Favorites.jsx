import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import './Favorites.css';

function Favorites() {
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { loadFavoritesFromServer } = useCart();

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setFavoriteProducts([]);
        setLoading(false);
        return;
      }
      
      // Загружаем избранное с сервера
      const response = await axios.get('http://127.0.0.1:8000/api/favorites/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const favoriteIds = response.data.map(f => f.part.id);
      localStorage.setItem('favorites', JSON.stringify(favoriteIds));
      
      if (favoriteIds.length === 0) {
        setFavoriteProducts([]);
        setLoading(false);
        return;
      }

      const promises = favoriteIds.map(id => 
        axios.get(`http://127.0.0.1:8000/api/parts/${id}/`)
      );
      const responses = await Promise.all(promises);
      setFavoriteProducts(responses.map(res => res.data));
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const removeFromFavorites = async (productId) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;
      
      await axios.post('http://127.0.0.1:8000/api/favorites/', {
        part_id: productId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Обновляем локально без перезагрузки
      const updatedFavorites = favoriteProducts.filter(p => p.id !== productId);
      setFavoriteProducts(updatedFavorites);
      
      // Обновляем localStorage
      const newFavoriteIds = updatedFavorites.map(p => p.id);
      localStorage.setItem('favorites', JSON.stringify(newFavoriteIds));
      
      // Отправляем событие для обновления счётчика в хедере
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (error) {
      console.error('Ошибка удаления из избранного:', error);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка избранного...</div>;
  }

  if (favoriteProducts.length === 0) {
    return (
      <div className="favorites-empty">
        <div className="empty-icon">❤️</div>
        <h2>В избранном пока ничего нет</h2>
        <p>Добавляйте товары в избранное, и они появятся здесь.</p>
        <Link to="/catalog" className="empty-button">Перейти в каталог</Link>
      </div>
    );
  }

  return (
    <div className="favorites">
      <div className="favorites-container">
        <h1>Избранное</h1>
        <p className="favorites-count">{favoriteProducts.length} товара</p>
        
        <div className="favorites-grid">
          {favoriteProducts.map(product => (
            <div key={product.id} className="favorite-card">
              <Link to={`/product/${product.id}`} className="favorite-link">
                <div className="favorite-image">
                  {product.image ? (
                    <img src={product.image} alt={product.name} />
                  ) : (
                    <div className="no-image">🛞</div>
                  )}
                </div>
                <h3 className="favorite-title">{product.name}</h3>
                <p className="favorite-price">{product.price} BYN</p>
              </Link>
              <button 
                className="remove-favorite"
                onClick={() => removeFromFavorites(product.id)}
              >
                🗑️ Удалить
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Favorites;