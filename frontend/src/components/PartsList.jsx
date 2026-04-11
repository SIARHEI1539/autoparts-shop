import React, { useState, useEffect } from 'react';
import axios from 'axios';

function PartsList() {
  // Состояния компонента
  const [parts, setParts] = useState([]);      // Список запчастей
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const [error, setError] = useState(null);     // Ошибка если есть

  // Функция загрузки данных с API
  const fetchParts = async () => {
    try {
      setLoading(true);
      // Запрос к нашему Django API
      const response = await axios.get('http://127.0.0.1:8000/api/parts/');
      setParts(response.data);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке:', err);
      setError('Не удалось загрузить запчасти. Убедитесь, что сервер Django запущен.');
    } finally {
      setLoading(false);
    }
  };

  // Загружаем данные при первом открытии компонента
  useEffect(() => {
    fetchParts();
  }, []);

  // Если загружается - показываем сообщение
  if (loading) {
    return <div className="loading">Загрузка запчастей...</div>;
  }

  // Если ошибка - показываем сообщение об ошибке
  if (error) {
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={fetchParts}>Попробовать снова</button>
      </div>
    );
  }

  // Если запчастей нет - показываем сообщение
  if (parts.length === 0) {
    return <div className="empty">Нет запчастей в базе данных</div>;
  }

  // Основная отрисовка списка запчастей
  return (
    <div className="parts-list">
      <h1>Каталог автозапчастей</h1>
      <div className="parts-grid">
        {parts.map((part) => (
          <div key={part.id} className="part-card">
            <h3>{part.name}</h3>
            <p className="manufacturer">Производитель: {part.manufacturer}</p>
            <p className="sku">Артикул: {part.sku}</p>
            <p className="price">Цена: {part.price} BYN</p>
            <p className="stock">В наличии: {part.stock} шт.</p>
            {part.compatibility && (
              <p className="compatibility">Совместимость: {part.compatibility}</p>
            )}
            <button className="buy-button">В корзину</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PartsList;