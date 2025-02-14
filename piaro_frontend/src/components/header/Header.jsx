import React, { useState } from 'react';
import Login from '../Auth/Login';
import Register from '../Auth/Register';
import { useAuth } from '../AuthContext/AuthContext';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import logo from '../../static/logo/OIG1.jpg';
import '../../sharedStyles/Header.css';

const Header = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { authUser, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); 
    navigate('/'); 
  };
  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="header">
      <div className="logo-container">
        <img src={logo} alt="Piaro Logo" className="logo" onClick={handleLogoClick} />
        <span className="logo-text">Piaro</span>
      </div>
      <div className="search-container">
        <SearchBar className="search-bar" />
      </div>
      <div className="auth-buttons" role="button">
        {isLoggedIn ? (
          <>
            <button onClick={handleProfileClick} aria-label="Profile">{authUser.username}</button>
            <button onClick={handleLogout} aria-label="Logout">Logout</button>
          </>
        ) : (
          <>
            <button onClick={() => setShowLogin(true)} aria-label="Login">Login</button>
            <button onClick={() => setShowRegister(true)} aria-label="Register"> Register</button>
          </>
        )}
      </div>
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
      {showRegister && <Register onClose={() => setShowRegister(false)} />}
    </header>
  );
};

export default Header;
