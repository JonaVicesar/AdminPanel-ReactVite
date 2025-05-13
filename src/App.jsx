import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css';
import AdminPanel from './AdminPanel';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './auth/AuthProvider';
import PrivateRoute from './auth/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Rutas protegidas */}
          <Route element={<PrivateRoute />}>
            <Route path="/admin" element={<AdminPanel />} />
          </Route>
          
          {/* Redirección para la ruta raíz */}
          <Route path="/" element={<Navigate to="/admin" replace />} />
          
          {/* Ruta para manejar rutas no encontradas */}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;