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
  const { getTotalCount, clearCart, loadCartFromServer, loadFavoritesFromServer, getFavoritesCount, favorites } = useCart();
  const cartCount = getTotalCount();

  // Обновление счётчика избранного
  const updateFavoritesCount = () => {
    const token = localStorage.getItem('access_token');
    let count = 0;
    
    if (token) {
      count = getFavoritesCount();
      console.log('❤️ Счётчик избранного (сервер):', count);
    } else {
      const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
      count = favs.length;
      console.log('❤️ Счётчик избранного (локальный):', count);
    }
    
    setFavoritesCount(count);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    console.log('🔍 Header загружен, токен:', !!token, 'пользователь:', savedUser);
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      loadCartFromServer();
      loadFavoritesFromServer();
    }
    
    updateFavoritesCount();
    
    // Слушаем обновления избранного
    window.addEventListener('favoritesUpdated', updateFavoritesCount);
    window.addEventListener('storage', updateFavoritesCount);
    
    return () => {
      window.removeEventListener('favoritesUpdated', updateFavoritesCount);
      window.removeEventListener('storage', updateFavoritesCount);
    };
  }, []);

  // Следим за изменением favorites в контексте
  useEffect(() => {
    updateFavoritesCount();
  }, [favorites]);

  const handleLogin = async (userData) => {
    console.log('🟢 Вход выполнен, загрузка данных...');
    setUser(userData);
    await loadCartFromServer();
    await loadFavoritesFromServer();
    updateFavoritesCount();
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleLogout = () => {
    console.log('🔴 Выход из аккаунта, очистка данных...');
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    clearCart();
    localStorage.removeItem('favorites');
    
    setUser(null);
    setFavoritesCount(0);
    
    navigate('/');
  };

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
                </button>
                {favoritesCount > 0 && <span className="favorites-count">{favoritesCount}</span>}
              </li>
              <li className="cart-item">
                <button 
                  className="nav-link cart-link"
                  onClick={(e) => handleProtectedClick(e, '/cart')}
                >
                  Корзина
                </button>
                {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
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