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
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { getTotalCount, clearCart, loadCartFromServer, loadFavoritesFromServer } = useCart();
  const cartCount = getTotalCount();

  const updateFavoritesCount = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavoritesCount(favorites.length);
    console.log('❤️ Счётчик избранного обновлён:', favorites.length);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('access_token');
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
      loadCartFromServer();
      loadFavoritesFromServer();
    }
    updateFavoritesCount();
    
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    window.addEventListener('storage', updateFavoritesCount);
    
    return () => {
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
      window.removeEventListener('storage', updateFavoritesCount);
    };
  }, []);

  const handleFavoritesUpdate = () => {
    console.log('❤️ Событие favoritesUpdated в Header');
    updateFavoritesCount();
  };

  const handleLogin = async (userData) => {
    console.log('🟢 Вход выполнен');
    setUser(userData);
    await loadCartFromServer();
    await loadFavoritesFromServer();
    updateFavoritesCount();
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleLogout = () => {
    console.log('🔴 Выход из аккаунта');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    clearCart();
    localStorage.removeItem('favorites');
    setUser(null);
    setFavoritesCount(0);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleProtectedNavigation = (path) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
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

          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Поиск запчастей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">🔍</button>
          </form>

          <button className="burger-menu" onClick={toggleMenu}>
            <span className={`burger-line ${menuOpen ? 'open' : ''}`}></span>
            <span className={`burger-line ${menuOpen ? 'open' : ''}`}></span>
            <span className={`burger-line ${menuOpen ? 'open' : ''}`}></span>
          </button>

          <nav className={`main-nav ${menuOpen ? 'open' : ''}`}>
            <ul>
              <li><Link to="/" className="nav-link" onClick={closeMenu}>Главная</Link></li>
              <li><Link to="/catalog" className="nav-link" onClick={closeMenu}>Каталог</Link></li>
              <li>
                <button 
                  className="nav-link orders-btn"
                  onClick={() => {
                    handleProtectedNavigation('/orders');
                    closeMenu();
                  }}
                >
                  Мои заказы
                </button>
              </li>
              <li className="favorites-item">
                <button 
                  className="nav-link favorites-btn"
                  onClick={() => {
                    handleProtectedNavigation('/favorites');
                    closeMenu();
                  }}
                >
                  Избранное
                </button>
                {favoritesCount > 0 && <span className="favorites-count">{favoritesCount}</span>}
              </li>
              <li className="cart-item">
                <button 
                  className="nav-link cart-link"
                  onClick={() => {
                    handleProtectedNavigation('/cart');
                    closeMenu();
                  }}
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