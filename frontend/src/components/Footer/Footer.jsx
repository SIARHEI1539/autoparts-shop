import React from 'react';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Колонка 1: Контакты */}
        <div className="footer-section">
          <h3>📞 Контакты</h3>
          <p>Телефон: +375 (29) 123-45-67</p>
          <p>Email: shop@autoparts.by</p>
          <p>Адрес: г. Минск, ул. Примерная, 123</p>
          <p>Время работы: Пн-Пт 9:00-19:00</p>
        </div>

        {/* Колонка 2: Информация */}
        <div className="footer-section">
          <h3>📜 Информация</h3>
          <ul>
            <li><a href="/about">О магазине</a></li>
            <li><a href="/guarantee">Гарантия</a></li>
            <li><a href="/return">Возврат товара</a></li>
            <li><a href="/privacy">Политика конфиденциальности</a></li>
            <li><a href="/vacancies">Вакансии</a></li>
          </ul>
        </div>

        {/* Колонка 3: Оплата и доставка */}
        <div className="footer-section">
          <h3>💳 Оплата и доставка</h3>
          <ul>
            <li><a href="/payment">Способы оплаты</a></li>
            <li><a href="/delivery">Условия доставки</a></li>
            <li><a href="/track">Отследить заказ</a></li>
            <li><a href="/pickup">Самовывоз</a></li>
          </ul>
        </div>
      </div>

      {/* Копирайт */}
      <div className="footer-bottom">
        <p>© {currentYear} Autoparts.by. Все права защищены.</p>
        <p>Магазин автозапчастей в Минске и Беларуси</p>
      </div>
    </footer>
  );
}

export default Footer;