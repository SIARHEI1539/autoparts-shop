import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount] = useState(3);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/" onClick={closeMenu}>
            <span className="logo-text">AUTOPARTS</span>
            <span className="logo-domain">.BY</span>
          </Link>
        </div>

        <button className="burger-menu" onClick={toggleMenu}>
          <span className={`burger-line ${menuOpen ? 'open' : ''}`}></span>
          <span className={`burger-line ${menuOpen ? 'open' : ''}`}></span>
          <span className={`burger-line ${menuOpen ? 'open' : ''}`}></span>
        </button>

        <nav className={`main-nav ${menuOpen ? 'open' : ''}`}>
          <ul>
            <li><Link to="/" className="nav-link" onClick={closeMenu}>Главная</Link></li>
            <li><Link to="/catalog" className="nav-link" onClick={closeMenu}>Каталог</Link></li>
            <li><Link to="/favorites" className="nav-link" onClick={closeMenu}>Избранное</Link></li>
            <li className="cart-item">
              <Link to="/cart" className="nav-link cart-link" onClick={closeMenu}>
                Корзина
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
              </Link>
            </li>
            <li><Link to="/profile" className="nav-link" onClick={closeMenu}>Профиль</Link></li>
            <li><Link to="/logout" className="nav-link logout-link" onClick={closeMenu}>Выход</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;