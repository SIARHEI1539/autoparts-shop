import React from 'react';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <div className="hero">
        <h1>Автозапчасти для иномарок</h1>
        <p>Оригинальные и качественные аналоги. Быстрая доставка по Беларуси.</p>
        <a href="/catalog" className="hero-button">Перейти в каталог</a>
      </div>
    </div>
  );
}

export default Home;