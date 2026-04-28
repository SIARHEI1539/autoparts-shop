import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import Reviews from '../../components/Reviews/Reviews';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('specs');
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart();
  
  // Refs для скролла к форме отзыва
  const reviewsTabRef = useRef(null);
  const reviewsFormRef = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://127.0.0.1:8000/api/parts/${id}/`);
        setProduct(response.data);
        
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

  const goBack = () => {
    navigate(-1);
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const productId = Number(id);
    
    if (isFavorite) {
      const newFavorites = favorites.filter(favId => favId !== productId);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      setIsFavorite(false);
    } else {
      favorites.push(productId);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(true);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert(`✅ ${product.name} добавлен в корзину!`);
  };

  // Функция для перехода к форме отзыва
  const handleWriteReview = () => {
    setActiveTab('reviews');
    // Небольшая задержка, чтобы вкладка успела отрендериться
    setTimeout(() => {
      if (reviewsFormRef.current) {
        reviewsFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Фокусируемся на поле имени
        const nameInput = reviewsFormRef.current.querySelector('input');
        if (nameInput) nameInput.focus();
      }
    }, 100);
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
                onClick={toggleFavorite}
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
  );
}

export default ProductDetail;