import React, { useState } from 'react';
import Login from '../Auth/Login';
import Register from '../Auth/Register';
import { useAuth } from '../AuthContext/AuthContext';
import { useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import logo from '../../static/logo/OIG1.jpg'
import '../../sharedStyles/Header.css';

const Header = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const { authUser, isLoggedIn, setAuthUser, setIsLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    setAuthUser(null);
    setIsLoggedIn(false);
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
      <img src={logo} alt="Piaro Logo" className="logo" onClick={handleLogoClick} />
      <div className="search-container">
        <SearchBar className="search-bar"/>
      </div>
      <div className="auth-buttons" role="button">
        {isLoggedIn ? (
          <>
            <button onClick={handleProfileClick}>{authUser.username}</button>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <button onClick={() => setShowLogin(true)}>Login</button>
            <button onClick={() => setShowRegister(true)}>Register</button>
          </>
        )}
      </div>
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
      {showRegister && <Register onClose={() => setShowRegister(false)} />}
    </header>
  );
};

export default Header;