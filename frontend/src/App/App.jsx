import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from '../context/CartContext';
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute';
import Layout from '../components/Layout/Layout';
import Home from '../pages/Home/Home';
import Catalog from '../pages/Catalog/Catalog';
import CategoryPage from '../pages/CategoryPage/CategoryPage';
import ProductDetail from '../pages/ProductDetail/ProductDetail';
import Favorites from '../pages/Favorites/Favorites';
import Cart from '../pages/Cart/Cart';
import SearchPage from '../pages/SearchPage/SearchPage';
import Checkout from '../pages/Checkout/Checkout';
// import Orders from '../pages/Orders/Orders';  
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
            <Route path="/search" element={<SearchPage />} />
            <Route path="/checkout" element={<Checkout />} />
            {/* <Route path="/orders" element={<Orders />} /> */}
            {/* Защищённые маршруты */}
            <Route path="/favorites" element={
              <ProtectedRoute>
                <Favorites />
              </ProtectedRoute>
            } />
            <Route path="/cart" element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            } />
          </Routes>
        </Layout>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;