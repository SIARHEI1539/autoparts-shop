import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import Home from '../pages/Home/Home';
import Catalog from '../pages/Catalog/Catalog';
import CategoryPage from '../pages/CategoryPage/CategoryPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/category/:id" element={<CategoryPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
