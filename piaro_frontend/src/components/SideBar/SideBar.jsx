import React, { useState, useEffect } from 'react';
import '../../sharedStyles/SideBar.css';
import { useAuth } from '../AuthContext/AuthContext';
import { useNavigate } from 'react-router-dom';

function SideBar() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const navigate = useNavigate();
  const { authUser, isLoggedIn } = useAuth();
  const [contentTypeCommunity, setContentTypeCommunity] = useState(0);
  const [contentTypeUser, setContentTypeUser] = useState(0);

  useEffect(() => {
    if (isLoggedIn) {
      fetchContentType().then(fetchSubscriptions);
    }
  }, [isLoggedIn, authUser]);

  useEffect(() => {
    if (subscriptions.length > 0) {
      fetchCommunities();
      fetchUsers();
    }
  }, [subscriptions]);

  const fetchContentType = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/utils/content_types/');
      const data = await response.json();
      setContentTypeCommunity(data.community);
      setContentTypeUser(data.user);
    } catch (error) {
      console.error('Error fetching content types:', error);
    }
  };

  const fetchSubscriptions = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/subscriptions/my_subscriptions/', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setSubscriptions(data);
      } catch (error) {
        console.error('There was an error fetching the user data!', error);
      }
    }
  };

  const fetchCommunities = async () => {
    const communitySubscriptions = subscriptions.filter(sub => sub.content_type === contentTypeCommunity);
    const communityIds = communitySubscriptions.map(sub => sub.object_id);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/communities/');
      const data = await response.json();
      const filteredCommunities = data.filter(community => communityIds.includes(community.id));
      setCommunities(filteredCommunities);
    } catch (error) {
      console.error('Error fetching communities:', error);
    }
  };

  const fetchUsers = async () => {
    const userSubscriptions = subscriptions.filter(sub => sub.content_type === contentTypeUser);
    const userIds = userSubscriptions.map(sub => sub.object_id);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/');
      const data = await response.json();
      const filteredUsers = data.filter(user => userIds.includes(user.id));
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCommunityClick = (id) => {
    navigate(`/community/${id}`);
  };

  return (
    <div className='sidebar'>
      {isLoggedIn ? (
        <div>
          <h2>Your Communities</h2>
          <ul>
            {communities.map(community => (
              <li key={community.id} onClick={() => handleCommunityClick(community.id)}>
                {community.name}
              </li>
            ))}
          </ul>
          <h2>Your Users</h2>
          <ul>
            {users.map(user => (
              <li key={user.id}>
                {user.username}
              </li>
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
  );
}

export default SideBar;

