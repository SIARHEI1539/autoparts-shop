import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import AuthModal from '../AuthModal/AuthModal';
import ProfileModal from '../ProfileModal/ProfileModal';
import './Header.css';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { getTotalCount } = useCart();
  const cartCount = getTotalCount();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
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
              {user ? (
                <>
                  <li>
                    <button 
                      className="nav-link user-name-btn" 
                      onClick={() => setIsProfileModalOpen(true)}
                    >
                      👤 {user.first_name || user.username}
                    </button>
                  </li>
                  <li><button className="nav-link logout-btn" onClick={handleLogout}>Выход</button></li>
                </>
              ) : (
                <li>
                  <button className="nav-link login-btn" onClick={() => setIsAuthModalOpen(true)}>
                    Вход
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </header>
      
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
      />
      
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onUpdate={handleUpdateUser}
      />
    </>
  );
}

export default Header;