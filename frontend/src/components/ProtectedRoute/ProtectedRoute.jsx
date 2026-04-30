import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    // Если нет токена, перенаправляем на главную
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default ProtectedRoute;