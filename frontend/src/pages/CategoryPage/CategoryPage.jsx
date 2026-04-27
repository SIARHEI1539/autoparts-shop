
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import './CategoryPage.css';

const categoryNames = {
  engine: 'Двигатель',
  transmission: 'Трансмиссия',
  brakes: 'Тормозная система',
  suspension: 'Подвеска',
  electrics: 'Электрика',
  body: 'Кузовные детали'
};

function CategoryPage() {
  const { id } = useParams();
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();  // ← добавили корзину

  useEffect(() => {
    const fetchParts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://127.0.0.1:8000/api/parts/?category=${id}`);
        setParts(response.data);
      } catch (error) {
        console.error('Ошибка загрузки:', error);
        setParts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchParts();
  }, [id]);

  const handleAddToCart = (part) => {
    addToCart(part, 1);
    alert(`✅ ${part.name} добавлен в корзину!`);
  };

  if (loading) {
    return <div className="loading">Загрузка запчастей...</div>;
  }

  if (parts.length === 0) {
    return <div className="empty">Нет запчастей в этой категории</div>;
  }

  return (
    <div className="category-page">
      <div className="category-header">
        <h1>{categoryNames[id] || id}</h1>
        <p>Найдено {parts.length} запчастей</p>
      </div>
      <div className="products-grid">
        {parts.map((part) => (
          <div key={part.id} className="product-card">
            <Link to={`/product/${part.id}`} className="product-link">
              <div className="product-image">
                {part.image ? (
                  <img src={part.image} alt={part.name} />
                ) : (
                  <div className="no-image">🚗</div>
                )}
              </div>
              <h3 className="product-title">{part.name}</h3>
              <p className="product-price">{part.price} BYN</p>
            </Link>
            <button 
              className="add-to-cart"
              onClick={() => handleAddToCart(part)}
            >
              🛒 В корзину
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryPage;