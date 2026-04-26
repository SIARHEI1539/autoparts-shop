import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Favorites.css';

function Favorites() {
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        
        if (favorites.length === 0) {
          setFavoriteProducts([]);
          setLoading(false);
          return;
        }

        // Загружаем данные по каждому ID из избранного
        const promises = favorites.map(id => 
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
    
    loadFavorites();
  }, []);

  const removeFromFavorites = (productId) => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const newFavorites = favorites.filter(id => id !== productId);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setFavoriteProducts(favoriteProducts.filter(p => p.id !== productId));
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