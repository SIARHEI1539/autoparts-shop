import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import AuthModal from '../AuthModal/AuthModal';
import ProfileModal from '../ProfileModal/ProfileModal';
import './Header.css';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const navigate = useNavigate();
  const { getTotalCount } = useCart();
  const cartCount = getTotalCount();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    updateFavoritesCount();
  }, []);

  const updateFavoritesCount = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavoritesCount(favorites.length);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    updateFavoritesCount();
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

  // Проверка авторизации перед переходом
  const handleProtectedClick = (e, path) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      e.preventDefault();
      setIsAuthModalOpen(true);
    } else {
      navigate(path);
    }
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
              <li className="favorites-item">
                <button 
                  className="nav-link favorites-btn"
                  onClick={(e) => handleProtectedClick(e, '/favorites')}
                >
                  Избранное
                  {favoritesCount > 0 && <span className="favorites-count">{favoritesCount}</span>}
                </button>
              </li>
              <li className="cart-item">
                <button 
                  className="nav-link cart-link"
                  onClick={(e) => handleProtectedClick(e, '/cart')}
                >
                  Корзина
                  {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                </button>
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