import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
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

  if (loading) {
    return <div className="loading">Загрузка запчастей...</div>;
  }

  return (
    <div className="category-page">
      <div className="category-header">
        <h1>{categoryNames[id] || id}</h1>
        <p>Найдено {parts.length} запчастей</p>
      </div>
      {parts.length === 0 ? (
        <div className="empty">Нет запчастей в этой категории</div>
      ) : (
        <div className="parts-grid-category">
          {parts.map((part) => (
            <div key={part.id} className="part-card-category">
              <h3>{part.name}</h3>
              <p className="manufacturer">{part.manufacturer}</p>
              <p className="sku">Артикул: {part.sku}</p>
              <p className="price">{part.price} BYN</p>
              <p className="stock">В наличии: {part.stock} шт.</p>
              <button className="buy-button">В корзину</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryPage;