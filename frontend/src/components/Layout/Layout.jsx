import React from 'react';
import Header from '../Header/Header';    // ← путь изменился
import Footer from '../Footer/Footer';    // ← путь изменился
import './Layout.css';

function Layout({ children }) {
  return (
    <div className="layout">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;