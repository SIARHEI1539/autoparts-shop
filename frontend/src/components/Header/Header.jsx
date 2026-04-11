import React, { useState } from 'react';
import './Header.css';

function Header() {
  // Состояние для поиска (пока просто храним, поиск сделаем позже)
  const [searchTerm, setSearchTerm] = useState('');
  // Количество товаров в корзине (пока заглушка, потом подключим)
  const [cartCount, setCartCount] = useState(1);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Поиск:', searchTerm);
    // Здесь позже добавим логику поиска
  };

  return (
    <header className="header">
      <div className="header-top">
        {/* Логотип */}
        <div className="logo">
          <a href="/">
            <span className="logo-icon">🚗</span>
            <span className="logo-text">AUTOPARTS.BY</span>
          </a>
        </div>

        {/* Поиск */}
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Поиск запчастей..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">🔍</button>
        </form>

        {/* Иконки действий */}
        <div className="header-actions">
          <div className="cart-icon">
            <a href="/cart">
              🛒
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </a>
          </div>
          <div className="user-icon">
            <a href="/login">👤</a>
          </div>
        </div>
      </div>

      {/* Навигационное меню */}
      <nav className="header-nav">
        <ul>
          <li><a href="/">Главная</a></li>
          <li><a href="/parts">Запчасти</a></li>
          <li><a href="/brands">Бренды</a></li>
          <li><a href="/delivery">Доставка</a></li>
          <li><a href="/contacts">Контакты</a></li>
          <li><a href="/about">О нас</a></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;