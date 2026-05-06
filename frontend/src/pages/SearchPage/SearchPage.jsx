import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import AuthModal from '../../components/AuthModal/AuthModal';
import './SearchPage.css';

function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const searchParts = async () => {
      if (!query) {
        setResults([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await axios.get(`http://127.0.0.1:8000/api/parts/?search=${encodeURIComponent(query)}`);
        setResults(response.data);
      } catch (error) {
        console.error('Ошибка поиска:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    
    searchParts();
  }, [query]);

  const handleAddToCart = (part) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }
    addToCart(part, 1);
    alert(`✅ ${part.name} добавлен в корзину!`);
  };

  return (
    <>
      <div className="search-page">
        <div className="search-container">
          <h1>Результаты поиска</h1>
          <p className="search-query">По запросу: <strong>{query}</strong></p>
          <p className="search-count">Найдено: {results.length} товаров</p>

          {loading ? (
            <div className="loading">Поиск...</div>
          ) : results.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h2>Ничего не найдено</h2>
              <p>Попробуйте изменить поисковый запрос</p>
              <Link to="/catalog" className="catalog-link">Перейти в каталог</Link>
            </div>
          ) : (
            <div className="search-results-grid">
              {results.map((part) => (
                <div key={part.id} className="search-result-card">
                  <Link to={`/product/${part.id}`} className="result-link">
                    <div className="result-image">
                      {part.image ? (
                        <img src={part.image} alt={part.name} />
                      ) : (
                        <div className="no-image">🚗</div>
                      )}
                    </div>
                    <h3 className="result-title">{part.name}</h3>
                    <p className="result-manufacturer">{part.manufacturer}</p>
                    <p className="result-sku">Артикул: {part.sku}</p>
                    <p className="result-price">{part.price} BYN</p>
                  </Link>
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(part)}
                  >
                    🛒 В корзину
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={() => {}}
      />
    </>
  );
}

export default SearchPage;