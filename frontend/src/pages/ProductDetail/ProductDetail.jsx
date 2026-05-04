import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import Reviews from '../../components/Reviews/Reviews';
import AuthModal from '../../components/AuthModal/AuthModal';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('specs');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { addToCart, toggleFavorite, loadFavoritesFromServer } = useCart();
  
  const reviewsTabRef = useRef(null);
  const reviewsFormRef = useRef(null);

  // Обновление состояния избранного
  const updateFavoriteStatus = () => {
    const token = localStorage.getItem('access_token');
    let favorites = [];
    
    if (token) {
      favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    } else {
      favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    }
    
    const isFav = favorites.includes(Number(id));
    setIsFavorite(isFav);
    console.log('❤️ Статус избранного обновлён, товар', id, ':', isFav);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log('🔄 Загрузка товара ID:', id);
        const response = await axios.get(`http://127.0.0.1:8000/api/parts/${id}/`);
        setProduct(response.data);
        console.log('✅ Товар загружен:', response.data.name);
        
        updateFavoriteStatus();
      } catch (error) {
        console.error('❌ Ошибка загрузки товара:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
    
    // Слушаем обновления избранного
    const handleFavoritesUpdate = () => {
      console.log('❤️ Событие favoritesUpdated получено');
      updateFavoriteStatus();
    };
    
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    
    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, [id]);

  const goBack = () => {
    navigate(-1);
  };

  const handleToggleFavorite = async () => {
    const token = localStorage.getItem('access_token');
    console.log('❤️ Кнопка избранного нажата, токен:', !!token, 'productId:', id);
    
    if (!token) {
      console.log('🔴 Нет токена, открываем окно входа');
      setIsAuthModalOpen(true);
      return;
    }
    
    // Оптимистичное обновление UI
    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);
    console.log('❤️ Оптимистичное обновление UI:', newFavoriteState);
    
    try {
      const result = await toggleFavorite(Number(id));
      console.log('✅ Запрос к серверу выполнен, результат:', result);
      
      // Обновляем из localStorage
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const updatedIsFavorite = favorites.includes(Number(id));
      setIsFavorite(updatedIsFavorite);
      
      // Отправляем событие для обновления счётчика в хедере
      window.dispatchEvent(new Event('favoritesUpdated'));
      
      console.log('❤️ Финальный статус избранного:', updatedIsFavorite);
    } catch (error) {
      console.error('❌ Ошибка при изменении избранного:', error);
      // Откатываем оптимистичное обновление при ошибке
      setIsFavorite(!newFavoriteState);
    }
  };

  const handleAddToCart = () => {
    const token = localStorage.getItem('access_token');
    console.log('🛒 addToCart вызван, токен:', !!token);
    
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }
    
    addToCart(product, quantity);
    alert(`✅ ${product.name} добавлен в корзину!`);
  };

  const handleWriteReview = () => {
    setActiveTab('reviews');
    setTimeout(() => {
      if (reviewsFormRef.current) {
        reviewsFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const nameInput = reviewsFormRef.current.querySelector('input');
        if (nameInput) nameInput.focus();
      }
    }, 100);
  };

  const handleLoginSuccess = async (userData) => {
    console.log('🟢 Вход выполнен, обновляем данные...');
    await loadFavoritesFromServer();
    setTimeout(() => {
      updateFavoriteStatus();
      window.dispatchEvent(new Event('favoritesUpdated'));
    }, 500);
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!product) {
    return <div className="error">Товар не найден</div>;
  }

  const specs = {
    'Бренд': product.manufacturer,
    'Артикул': product.sku,
    'Наличие': `${product.stock} шт.`,
    'Совместимость': product.compatibility || 'Универсальная',
  };

  return (
    <>
      <div className="product-detail">
        <div className="product-detail-container">
          <div className="breadcrumb">
            <span onClick={goBack} className="breadcrumb-link">Каталог</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{product.name}</span>
          </div>

          <div className="product-detail-grid">
            <div className="product-detail-image">
              {product.image ? (
                <img src={product.image} alt={product.name} />
              ) : (
                <div className="no-image-big">🛞</div>
              )}
            </div>

            <div className="product-detail-info">
              <div className="product-header">
                <h1>{product.name}</h1>
                <button 
                  className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                  onClick={handleToggleFavorite}
                >
                  <span className="favorite-icon">{isFavorite ? '❤️' : '🤍'}</span>
                  <span className="favorite-text">{isFavorite ? 'В избранном' : 'В избранное'}</span>
                </button>
              </div>
              
              <div className="product-rating">
                <span className="stars">★★★★</span>
                <span className="rating-link" onClick={handleWriteReview}>
                  Написать отзыв
                </span>
              </div>

              <div className="product-specs">
                {Object.entries(specs).map(([key, value]) => (
                  <div className="spec-item" key={key}>
                    <span className="spec-label">{key}:</span>
                    <span className="spec-value">{value}</span>
                  </div>
                ))}
              </div>

              <div className="product-price-section">
                <div className="product-price">{product.price} BYN</div>
                <div className="product-price-note">за 1 шт.</div>
              </div>

              <div className="product-quantity">
                <div className="quantity-label">Количество:</div>
                <div className="quantity-control">
                  <button 
                    className="quantity-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span className="quantity-value">{quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
                <div className="in-stock-badge">
                  ⏱ В наличии: {product.stock} шт.
                </div>
              </div>

              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                В КОРЗИНУ
              </button>
            </div>
          </div>

          <div className="product-tabs" ref={reviewsTabRef}>
            <div className="tabs-header">
              <button 
                className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
                onClick={() => setActiveTab('specs')}
              >
                ХАРАКТЕРИСТИКИ И ОПИСАНИЕ
              </button>
              <button 
                className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                ОТЗЫВЫ
              </button>
            </div>
            
            <div className="tabs-content">
              {activeTab === 'specs' && (
                <div className="specs-content">
                  <p className="product-description-text">{product.description}</p>
                </div>
              )}
              
              {activeTab === 'reviews' && (
                <div ref={reviewsFormRef}>
                  <Reviews partId={product.id} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLoginSuccess}
      />
    </>
  );
}

export default ProductDetail;