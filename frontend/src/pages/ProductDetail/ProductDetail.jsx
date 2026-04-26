import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('specs');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://127.0.0.1:8000/api/parts/${id}/`);
        setProduct(response.data);
        
        // Проверяем, есть ли товар в избранном (из localStorage)
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
        setIsFavorite(favorites.includes(Number(id)));
      } catch (error) {
        console.error('Ошибка загрузки:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCart = () => {
    console.log('Добавлено в корзину:', product?.name, 'x', quantity);
  };

  const goBack = () => {
    navigate(-1);
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const productId = Number(id);
    
    if (isFavorite) {
      // Удаляем из избранного
      const newFavorites = favorites.filter(favId => favId !== productId);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      setIsFavorite(false);
    } else {
      // Добавляем в избранное
      favorites.push(productId);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(true);
    }
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
    'Категория': product.category,
  };

  return (
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
            <h1>{product.name}</h1>
            
            <div className="product-rating">
              <span className="stars">★★★★</span>
              <span className="rating-link">Написать отзыв</span>
            </div>

            {/* Кнопка "В избранное" */}
            <button 
              className={`favorite-btn ${isFavorite ? 'active' : ''}`}
              onClick={toggleFavorite}
            >
              <span className="favorite-icon">{isFavorite ? '❤️' : '🤍'}</span>
              <span className="favorite-text">{isFavorite ? 'В избранном' : 'В избранное'}</span>
            </button>

            <div className="product-specs">
              <div className="spec-item">
                <span className="spec-label">Бренд:</span>
                <span className="spec-value">{product.manufacturer}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Артикул:</span>
                <span className="spec-value">{product.sku}</span>
              </div>
              <div className="spec-item">
                <span className="spec-label">Наличие:</span>
                <span className="spec-value in-stock">В наличии: {product.stock} шт.</span>
              </div>
              {product.compatibility && (
                <div className="spec-item">
                  <span className="spec-label">Совместимость:</span>
                  <span className="spec-value">{product.compatibility}</span>
                </div>
              )}
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

            <button className="add-to-cart-btn" onClick={addToCart}>
              В КОРЗИНУ
            </button>
          </div>
        </div>

        <div className="product-tabs">
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
                <div className="specs-table">
                  {Object.entries(specs).map(([key, value]) => (
                    <div className="specs-row" key={key}>
                      <span className="specs-label">{key}:</span>
                      <span className="specs-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div className="reviews-content">
                <p>Отзывов пока нет. Будьте первым, кто оставит отзыв!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;