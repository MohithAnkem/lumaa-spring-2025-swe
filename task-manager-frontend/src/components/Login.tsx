import React, { useState } from 'react';
import axios from 'axios';
import api from '../api/api'; // Adjust the path as necessary
import { useAuth } from '../context/AuthContext'; // Adjust the path as necessary
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';


const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        //const response = await api.post('/auth/login', { username, password });
        const response = await axios.post('http://localhost:3001/auth/login', { username, password });
        localStorage.setItem('token', response.data.token);
      login(response.data.token);
      navigate('/tasks');
      } catch (err) {
        setError('Invalid username or password');
      }
    };
  
    return (
        <div>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit">Login</button>
        </form>
        <p>
            Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    );
  };
export default Login;