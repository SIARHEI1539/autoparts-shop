import React, { useState } from 'react';
import './Header.css';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount] = useState(3); // потом подключишь к реальному состоянию

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="header">
      <div className="header-container">
        {/* Логотип */}
        <div className="logo">
          <a href="/">
            <span className="logo-icon">🚗</span>
            <span className="logo-text">AUTOPARTS</span>
            <span className="logo-domain">.BY</span>
          </a>
        </div>

        {/* Бургер-иконка (видна только на мобилках) */}
        <button className="burger-menu" onClick={toggleMenu}>
          <span className={`burger-line ${menuOpen ? 'open' : ''}`}></span>
          <span className={`burger-line ${menuOpen ? 'open' : ''}`}></span>
          <span className={`burger-line ${menuOpen ? 'open' : ''}`}></span>
        </button>

        {/* Навигационное меню */}
        <nav className={`main-nav ${menuOpen ? 'open' : ''}`}>
          <ul>
            <li><a href="/" className="nav-link" onClick={closeMenu}>🏠 Главная</a></li>
            <li><a href="/catalog" className="nav-link" onClick={closeMenu}>📦 Каталог</a></li>
            <li><a href="/favorites" className="nav-link" onClick={closeMenu}>❤️ Избранное</a></li>
            <li className="cart-item">
              <a href="/cart" className="nav-link cart-link" onClick={closeMenu}>
                🛒 Корзина
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </a>
            </li>
            <li><a href="/profile" className="nav-link" onClick={closeMenu}>👤 Профиль</a></li>
            <li><a href="/logout" className="nav-link logout-link" onClick={closeMenu}>🚪 Выход</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;