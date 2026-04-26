import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://127.0.0.1:8000/api/parts/${id}/`);
        setProduct(response.data);
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
    console.log('Добавлено в корзину:', product?.name);
  };

  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!product) {
    return <div className="error">Товар не найден</div>;
  }

  return (
    <div className="product-detail">
      <div className="product-detail-container">
        {/* Только кнопка "Назад" */}
        <button className="back-button" onClick={goBack}>
          ← Назад
        </button>

        <div className="product-detail-grid">
          <div className="product-detail-image">
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <div className="no-image-big">🚗</div>
            )}
          </div>

          <div className="product-detail-info">
            <h1>{product.name}</h1>
            
            <div className="product-meta">
              <div className="meta-item">
                <span className="meta-label">Производитель:</span>
                <span className="meta-value">{product.manufacturer}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Артикул:</span>
                <span className="meta-value">{product.sku}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Наличие:</span>
                <span className={`stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {product.stock > 0 ? `В наличии (${product.stock} шт.)` : 'Нет в наличии'}
                </span>
              </div>
              {product.compatibility && (
                <div className="meta-item">
                  <span className="meta-label">Совместимость:</span>
                  <span className="meta-value">{product.compatibility}</span>
                </div>
              )}
            </div>

            <div className="product-price-big">
              {product.price} BYN
            </div>

            <button className="add-to-cart-big" onClick={addToCart}>
              🛒 Добавить в корзину
            </button>

            <div className="product-description">
              <h3>Описание</h3>
              <p>{product.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;