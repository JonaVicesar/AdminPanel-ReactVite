// Dentro de PrivateRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  console.log("Auth state:", { isAuthenticated: isAuthenticated(), loading, token: localStorage.getItem('authToken') });
  
  
  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  const token = localStorage.getItem('authToken');
  

  return token && isAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;