import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { useAuth } from '../auth/AuthProvider';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Verificar credenciales contra la base de datos
      const response = await fetch(`http://localhost:3001/users?username=${credentials.username}&password=${credentials.password}`);
      const users = await response.json();

      if (users.length === 1) {
        // Usuario encontrado
        const user = users[0];
        login({
          id: user.id,
          username: user.username,
          nameandSurname: user.nameandSurname,
          phone: user.phone,
          role: user.role
        });
        navigate('/admin');
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <CardHeader>
          <CardTitle className="login-title">Iniciar Sesión</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="label">Usuario</label>
              <input
                type="text"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div className="form-group">
              <label className="label">Contraseña</label>
              <input
                type="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <button type="submit" className="btn btn-login">
              Ingresar
            </button>
            <div className="form-footer">
              ¿No tienes una cuenta? <Link to="/register">Regístrate</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;