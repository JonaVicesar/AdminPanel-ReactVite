import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import '../styles/Login.css'; 

const Register = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    nameandSurname: '',
    username: '',
    password: '',
    phone: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    //validacion de contraseña
    if (userData.password !== userData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      //verifcar que el usuario no exista
      const checkResponse = await fetch(`http://localhost:3001/users?username=${userData.username}`);
      const existingUsers = await checkResponse.json();
      
      if (existingUsers.length > 0) {
        setError('El nombre de usuario ya está en uso');
        return;
      }

      // crear nuevo usuario
      const response = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nameandSurname: userData.nameandSurname,
          username: userData.username,
          password: userData.password,
          phone: userData.phone,
          role: 'admin'
        }),
      });

      if (response.ok) {
        navigate('/login');
      } else {
        setError('Error al crear usuario');
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
          <CardTitle className="login-title">Registro de Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="label">Nombre y Apellido</label>
              <input  
                type="text"
                name="nameandSurname"
                value={userData.nameandSurname}
                onChange={handleChange}
                className="input"
                required 
              />
            </div>

            <div className="form-group">
              <label className="label">Nombre de Usuario</label>
              <input
                type="text"
                name="username"
                value={userData.username}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
           
            <div className="form-group">
              <label className="label">Teléfono</label>
              <input
                type="text"
                name="phone"
                value={userData.phone}
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
                value={userData.password}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div className="form-group">
              <label className="label">Confirmar Contraseña</label>
              <input
                type="password"
                name="confirmPassword"
                value={userData.confirmPassword}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <button type="submit" className="btn btn-login">
              Registrarse
            </button>
            <div className="form-footer">
              ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;