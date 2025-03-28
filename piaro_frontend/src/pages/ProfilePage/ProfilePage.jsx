import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../components/AuthContext/AuthContext';
import default_profile_photo from '../../static/default_profile_photo.png';
import '../../sharedStyles/ProfilePage.css';

const ProfilePage = () => {
  const { authUser, setAuthUser, authFetch } = useAuth(); // Get authFetch from context
  const [userData, setUserData] = useState(authUser);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const fetchUserData = useCallback(async () => {
    try {
      const response = await authFetch('/users/me/');
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, [authFetch]);

  const handleFieldUpdate = async (field) => {
    try {
      const response = await authFetch('/users/update_field/', {
        method: 'PUT',
        body: JSON.stringify({
          field: field,
          value: userData[field]
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAuthUser(data);
        setUserData(data);
        alert('Profile updated successfully');
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Update failed. Please try again.');
    }
  };

  const handlePhotoUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('profile_photo', userData.profile_photo);

    try {
      const response = await authFetch('/users/update_profile_photo/', {
        method: 'PUT',
        body: formData,
        headers: {} // Let authFetch handle headers
      });

      if (response.ok) {
        const data = await response.json();
        setAuthUser(data);
        setUserData(data);
        alert('Profile photo updated successfully');
      } else {
        throw new Error('Photo update failed');
      }
    } catch (error) {
      console.error('Error updating photo:', error);
      setError('Photo update failed. Please try again.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const response = await authFetch('/users/change_password/', {
        method: 'PUT',
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          confirm_new_password: confirmNewPassword,
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'Password changed successfully') {
          alert('Password changed successfully');
          setOldPassword('');
          setNewPassword('');
          setConfirmNewPassword('');
        } else {
          throw new Error(data.message || 'Password change failed');
        }
      } else {
        throw new Error('Password change failed');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Password change failed. Please try again.');
    }
  };

  const handleVerifyCode = async () => {
    try {
      const response = await authFetch('/users/verify_tg/', {
        method: 'PUT',
        body: JSON.stringify({
          code: verificationCode,
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success') {
          alert('Telegram contact verified successfully');
          setAuthUser({ ...userData, tg_contact: data.tg_contact });
        } else {
          throw new Error(data.message || 'Verification failed');
        }
      } else {
        throw new Error('Verification failed');
      }
    } catch (error) {
      console.error('Error verifying Telegram:', error);
      setError('Verification failed. Please try again.');
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return (
    <div className="profile-container">
      <h2 className="profile-header">{userData.username}</h2>
      {error && <p className="error">{error}</p>}
      {userData.profile_photo ? ( 
            <img src={userData.profile_photo} alt="Profile" className="profile-photo" /> 
            ) : ( 
            <div> 
              <img src={default_profile_photo} alt="Profile" className="profile-photo" /> 
            <p className="no-photo">No profile photo</p> </div> 
      )} 
      <form onSubmit={handlePhotoUpdate} className="profile-form"> 
        <div className="profile-photo-section"> 
          <input 
            type="file" 
            id="profilePhoto" 
            onChange={(e) => setUserData({ ...userData, profile_photo: e.target.files[0] })} 
            className="profile-photo-input" style={{ display: 'none' }} 
          /> 
          <label htmlFor="profilePhoto" className="profile-photo-input-label"> Choose Photo </label> 
        </div> 
        <button type="submit" className="update-button">Update photo</button> 
      </form> 
      <form className="profile-form"> 
        <label className="profile-label"> 
          <input 
            type="email" 
            placeholder='Email: '
            value={userData.email || ''} 
            onChange={(e) => setUserData({ ...userData, email: e.target.value })} 
            className="profile-input" 
          /> 
          <button type="button" onClick={() => handleFieldUpdate('email', userData.email)} className="update-button"> 
            Update Email 
          </button> 
        </label> 
        <label className="profile-label">  
          <input 
            type="text" 
            placeholder='Contact Number:'
            value={userData.contact_number || ''} 
            onChange={(e) => setUserData({ ...userData, contact_number: e.target.value })} 
            className="profile-input" /> 
          <button type="button" onClick={() => handleFieldUpdate('contact_number', userData.contact_number)} className="update-button">
            Update Contact Number 
          </button> 
        </label> 
        {userData.tg_contact ? (
          <label className="profile-label">
            <input
              type="text"
              placeholder='Telegram Contact: '
              value={userData.tg_contact}
              onChange={(e) => setUserData({ ...userData, tg_contact: e.target.value})}
              className="profile-intut" 
            />
            <button type="button" onClick={() => handleFieldUpdate('tg_contact', userData.tg_contact)} className="update-button">
              Update TG Contact
            </button>
          </label>
        ) : (
          <div>
            <a href="https://t.me/piarorobot" className="tg-button" target="_blank" rel="noopener noreferrer">Verify tg </a>
            <label className="profile-label">
              <input
                type="text"
                placeholder="Enter Confirmation Code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="profile-input"
              />
              <button type="button" onClick={handleVerifyCode} className="update-button">
                Verify tg Contact
              </button>
            </label>
          </div>
        )}
      </form>
      <h2 className="profile-header">Change Password</h2>
      <form onSubmit={handleChangePassword} className="password-form">
        <label className="profile-label">
          Old Password:
          <input
            type="password"
            value={oldPassword || ''}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            className="profile-input"
          />
        </label>
        <label className="profile-label">
          New Password:
          <input
            type="password"
            value={newPassword || ''}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="profile-input"
          />
        </label>
        <label className="profile-label">
          Confirm New Password:
          <input
            type="password"
            value={confirmNewPassword || ''}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
            className="profile-input"
          />
        </label>
        <button type="submit" className="change-password-button">Change Password</button>
      </form>
    </div>
  );
};

export default ProfilePage;

