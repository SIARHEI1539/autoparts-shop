import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from '../context/CartContext';
import Layout from '../components/Layout/Layout';
import Home from '../pages/Home/Home';
import Catalog from '../pages/Catalog/Catalog';
import CategoryPage from '../pages/CategoryPage/CategoryPage';
import ProductDetail from '../pages/ProductDetail/ProductDetail';
import Favorites from '../pages/Favorites/Favorites';
import Cart from '../pages/Cart/Cart';
import './App.css';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/category/:id" element={<CategoryPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
