import React, { useState, useEffect } from 'react';
import '../../sharedStyles/SideBar.css'
import { useAuth } from '../AuthContext/AuthContext';
import { useNavigate } from 'react-router-dom';

function SideBar() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const navigate = useNavigate();
  const { authUser, isLoggedIn, setAuthUser, setIsLoggedIn } = useAuth();
  const [contentTypeCommunity, setContentTypeCommunity] = useState(0);
  const [contentTypeUser, setContentTypeUser] = useState(0);

  useEffect(() => {
    fetchSubscriptions();
    fetchContentType();
    fetchCommunities();
    fetchUsers();
  }, [isLoggedIn, authUser]);

  const fetchContentType = () => {
    fetch('http://127.0.0.1:8000/api/utils/content_types/')
      .then(response => response.json())
      .then(data => {
        setContentTypeCommunity(data.community);
        setContentTypeUser(data.user);
      })
      .catch(error => console.error('Error fetching content types:', error));
  };

  const fetchSubscriptions = () => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('http://127.0.0.1:8000/api/subscriptions/my_subscriptions/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setSubscriptions(data);
      })
      .catch(error => {
        console.error('There was an error fetching the user data!', error);
      });
    }
  };

  const fetchCommunities = () => {
    const communitySubscriptions = subscriptions.filter(sub => sub.content_type === contentTypeCommunity);
    const communityIds = communitySubscriptions.map(sub => sub.object_id);

    fetch('http://127.0.0.1:8000/api/communities/')
      .then(response => response.json())
      .then(data => {
        const filteredCommunities = data.filter(community => communityIds.includes(community.id));
        setCommunities(filteredCommunities);
      })
      .catch(error => console.error('Error fetching communities:', error));
  };

  const fetchUsers = () => {
    const userSubscriptions = subscriptions.filter(sub => sub.content_type === contentTypeUser);
    const userIds = userSubscriptions.map(sub => sub.object_id);

    fetch('http://127.0.0.1:8000/api/users/')
      .then(response => response.json())
      .then(data => {
        const filteredUsers = data.filter(user => userIds.includes(user.id));
        setUsers(filteredUsers);
      })
      .catch(error => console.error('Error fetching users:', error));
  };



  const handleCommunityClick = (id) => {
      navigate(`/community/${id}`);
  }


  return (
    <div className='sidebar'>
      {isLoggedIn ? (
        <div>
          <h2>Your Communities</h2>
          <ul>
            {communities.map(community => (
              <li key={community.id} onClick={() => handleCommunityClick(community.id)}>{community.name}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <h2>Welcome</h2>
          <p>Please log in to see your communities.</p>
        </div>
      )}
    </div>
  )
}

export default SideBar;