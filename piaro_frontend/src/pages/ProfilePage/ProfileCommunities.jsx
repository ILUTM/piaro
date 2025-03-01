import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../utils/navigation'; 
import '../../sharedStyles/ProfilePage.css';

const ProfileCommunities = () => {
  const [communities, setCommunities] = useState([]);
  const [newCommunity, setNewCommunity] = useState({name: '', description: ''});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { goToCommunity } = useNavigation();

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Fetch user's communities
    fetch('http://127.0.0.1:8000/api/communities/my_communities/', {
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
      setCommunities(data);
    })
    .catch(error => {
      console.error('There was an error fetching the communities!', error);
      setError('Failed to fetch communities. Please try again.');
    });
  }, []);

  const handleCreateCommunity = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    fetch('http://127.0.0.1:8000/api/communities/create_community/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newCommunity)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      setCommunities([...communities, data]);
      setNewCommunity({ name: '', description: '' });
      setSuccess('Community created successfully');
    })
    .catch(error => {
      console.error('There was an error creating the community!', error);
      setError('Failed to create community. Please try again.');
    });
  };

  const handleCommunityClick = (slug) => {
    goToCommunity(slug);
  };

  return (
    <div>
      <h2>My Communities</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <ul>
        {communities.map(community => (
          <li key={community.id} onClick={() => handleCommunityClick(community.slug)}>{community.name}</li>
        ))}
      </ul>
      <h3>Create New Community</h3>
      <form onSubmit={handleCreateCommunity}>
        <label>
          Name:
          <input
            type="text"
            value={newCommunity.name}
            onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
            required
          />
        </label>
        <label>
          Description:
          <textarea
            value={newCommunity.description}
            onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
            required
          />
        </label>
        <button type="submit">Create Community</button>
      </form>
    </div>
  );
};

export default ProfileCommunities;