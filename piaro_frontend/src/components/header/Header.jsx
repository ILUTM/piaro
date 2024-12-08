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
    fetch('http://127.0.0.1:8000/api/logout/', { 
      method: 'POST', 
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`, 
        'Content-Type': 'application/json', 
      } }) 
    .then(response => { 
      if (!response.ok) { 
        throw new Error('Network response was not ok'); 
      } 
      localStorage.removeItem('token'); 
      setAuthUser(null); setIsLoggedIn(false); 
      navigate('/'); }) 
    .catch(error => { 
      console.error('There was an error logging out!', error); 
    }); 
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