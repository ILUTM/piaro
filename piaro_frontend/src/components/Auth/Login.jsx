// Login.js
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import styles from '../../sharedStyles/Auth.module.css'; // Importing CSS Module
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
      credentials: 'include',
      body: JSON.stringify({
        username: username,
        password: password,
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
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
      setError('Login failed. Please try again.');
    });
  };

  return ReactDOM.createPortal(
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <span className={styles.close} onClick={onClose}>&times;</span>
        <h2>Login</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>
            Username:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root') // Rendering into modal-root
  );
};

export default Login;
