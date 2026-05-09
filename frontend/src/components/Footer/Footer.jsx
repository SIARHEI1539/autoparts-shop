import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Footer.css';

function Footer({ onAuthRequired }) {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  const handleProtectedClick = (path, e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      // Вызываем открытие модального окна
      if (onAuthRequired) {
        onAuthRequired();
      } else {
        alert('Пожалуйста, войдите в аккаунт');
      }
    } else {
      navigate(path);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h4>Автозапчасти.BY</h4>
          <p>Оригинальные запчасти для всех марок автомобилей</p>
          <p className="footer-copyright">© {currentYear} Автозапчасти.BY</p>
        </div>

        <div className="footer-section">
          <h4>Информация</h4>
          <ul>
            <li><Link to="/catalog">Каталог</Link></li>
            <li>
              <a 
                href="/orders" 
                onClick={(e) => handleProtectedClick('/orders', e)}
                style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
              >
                Мои заказы
              </a>
            </li>
            <li>
              <a 
                href="/favorites" 
                onClick={(e) => handleProtectedClick('/favorites', e)}
                style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
              >
                Избранное
              </a>
            </li>
            <li>
              <a 
                href="/cart" 
                onClick={(e) => handleProtectedClick('/cart', e)}
                style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
              >
                Корзина
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Контакты</h4>
          <p>📞 +375 (29) 123-45-67</p>
          <p>📧 info@autoparts.by</p>
          <p>📍 г. Минск, ул. Примерная, 123</p>
        </div>

        <div className="footer-section">
          <h4>Часы работы</h4>
          <p>🕐 Пн-Пт: 9:00 - 19:00</p>
          <p>🕐 Сб: 10:00 - 16:00</p>
          <p>🕐 Вс: Выходной</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;