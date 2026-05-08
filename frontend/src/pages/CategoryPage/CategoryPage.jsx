import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../../context/CartContext';
import AuthModal from '../../components/AuthModal/AuthModal';
import Pagination from '../../components/Pagination/Pagination';
import './CategoryPage.css';

const categoryNames = {
  engine: 'Двигатель',
  transmission: 'Трансмиссия',
  brakes: 'Тормозная система',
  suspension: 'Подвеска',
  electrics: 'Электрика',
  body: 'Кузовные детали',
  other: 'Другое'
};

const ITEMS_PER_PAGE = 3;

function CategoryPage() {
  const { id } = useParams();
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const { addToCart } = useCart();

  useEffect(() => {
    setCurrentPage(1);
  }, [id]);

  useEffect(() => {
    const fetchParts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://127.0.0.1:8000/api/parts/?category=${id}&page=${currentPage}`
        );
        
        if (response.data.results) {
          setParts(response.data.results);
          setTotalProducts(response.data.count);
          setTotalPages(Math.ceil(response.data.count / ITEMS_PER_PAGE));
        } else {
          setParts(response.data);
          setTotalProducts(response.data.length);
          setTotalPages(Math.ceil(response.data.length / ITEMS_PER_PAGE));
        }
      } catch (error) {
        console.error('Ошибка загрузки:', error);
        setParts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchParts();
  }, [id, currentPage]);

  const handleAddToCart = (part) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsAuthModalOpen(true);
      return;
    }
    addToCart(part, 1);
    alert(`✅ ${part.name} добавлен в корзину!`);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Добавляем стили прямо в компонент на всякий случай
  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
    marginBottom: '2rem'
  };

  if (loading) {
    return (
      <div className="category-loading">
        <div className="spinner"></div>
        <p>Загрузка запчастей...</p>
      </div>
    );
  }

  if (parts.length === 0) {
    return (
      <div className="category-empty">
        <p>Нет запчастей в этой категории</p>
        <Link to="/catalog">Вернуться к категориям</Link>
      </div>
    );
  }

  return (
    <>
      <div className="category-page">
        <div className="category-header">
          <h1>{categoryNames[id] || id}</h1>
          <p className="category-count">Найдено {totalProducts} запчастей (страница {currentPage} из {totalPages})</p>
        </div>
        
        <div className="products-grid" style={gridStyles}>
          {parts.map((part) => (
            <div key={part.id} className="product-card">
              <Link to={`/product/${part.id}`} className="product-link">
                <div className="product-image">
                  {part.image ? (
                    <img src={part.image} alt={part.name} />
                  ) : (
                    <div className="no-image">🚗</div>
                  )}
                </div>
                <h3 className="product-title">{part.name}</h3>
                <p className="product-manufacturer">{part.manufacturer}</p>
                <p className="product-price">{part.price} BYN</p>
              </Link>
              <button 
                className="add-to-cart"
                onClick={() => handleAddToCart(part)}
              >
                🛒 В корзину
              </button>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={() => {}}
      />
    </>
  );
}

export default CategoryPage;