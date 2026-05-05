import React from 'react';
import { Link } from 'react-router-dom';
import './Catalog.css';

const categories = [
  { id: 'engine', name: 'Двигатель', icon: '🔧', count: 15, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'transmission', name: 'Трансмиссия', icon: '⚙️', count: 15, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'brakes', name: 'Тормозная система', icon: '🛑', count: 15, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 'suspension', name: 'Подвеска', icon: '🔄', count: 15, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { id: 'electrics', name: 'Электрика', icon: '⚡', count: 15, gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: 'body', name: 'Кузовные детали', icon: '🚗', count: 15, gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
];

function Catalog() {
  return (
    <div className="catalog">
      <h1>Каталог автозапчастей</h1>
      <p className="catalog-subtitle">Выберите категорию</p>
      <div className="categories-grid">
        {categories.map((cat) => (
          <Link to={`/category/${cat.id}`} key={cat.id} className="category-card">
            <div className="category-icon">{cat.icon}</div>
            <h3 className="category-name">{cat.name}</h3>
            <span className="category-count">{cat.count} запчастей</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Catalog;