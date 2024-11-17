import React, { useState } from 'react';
import '../../sharedStyles/Auth.module.css';
import { useAuth } from '../AuthContext/AuthContext';

const Login = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setAuthUser, setIsLoggedIn } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://127.0.0.1:8000/api/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password,
      })
    })
    .then(response=> {
      if(!response.ok) {
        throw new Error('NEtwork response was not ok')
      }
      return response.json();
    })
    .then(data => {
      console.log('Login successful', data);
      localStorage.setItem('token', data.access);
      setAuthUser(data);
      setIsLoggedIn(true);
      onClose();
    })
    .catch(error => {
      console.error('There was an error logging in!', error);
      setError('Login failed. Please try again.')
    })
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>
            Username:
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </label>
          <label>
            Password:
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
