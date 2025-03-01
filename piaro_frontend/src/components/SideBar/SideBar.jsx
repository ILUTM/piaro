import React, { useState, useEffect } from 'react';
import '../../sharedStyles/SideBar.css';
import { useAuth } from '../AuthContext/AuthContext';
import { useNavigation } from '../../utils/navigation'; 
import { fetchMyCollections } from '../../utils/collectionUtils';
import CreateCollectionForm from './CreateCollectionForm';
import CollectionViewModal from './CollectionViewModal';

function SideBar() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [isCommunitiesOpen, setIsCommunitiesOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { goToCommunity, goToUser } = useNavigation();
  const { authUser, isLoggedIn } = useAuth();
  const [contentTypeCommunity, setContentTypeCommunity] = useState(0);
  const [contentTypeUser, setContentTypeUser] = useState(0);

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn, authUser]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await fetchContentType();
      await fetchSubscriptions();
      await fetchCollectionsList();
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (subscriptions.length > 0) {
      fetchCommunities();
      fetchUsers();
    }
  }, [subscriptions]);

  const fetchContentType = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/utils/content_types/');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setContentTypeCommunity(data.community);
      setContentTypeUser(data.user);
    } catch (error) {
      console.error('Error fetching content types:', error);
      throw error;
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
        console.error('Error fetching subscriptions:', error);
        throw error;
      }
    }
  };

  const fetchCommunities = async () => {
    const communitySubscriptions = subscriptions.filter(sub => sub.content_type === contentTypeCommunity);
    const communityIds = communitySubscriptions.map(sub => sub.object_id);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/communities/');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const filteredCommunities = data.filter(community => communityIds.includes(community.id));
      setCommunities(filteredCommunities);
    } catch (error) {
      console.error('Error fetching communities:', error);
      throw error;
    }
  };

  const fetchUsers = async () => {
    const userSubscriptions = subscriptions.filter(sub => sub.content_type === contentTypeUser);
    const userIds = userSubscriptions.map(sub => sub.object_id);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      const filteredUsers = data.filter(user => userIds.includes(user.id));
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  };

  const fetchCollectionsList = async () => {
    const token = localStorage.getItem('token');
    try {
      const collections = await fetchMyCollections(token);
      setCollections(collections);
    } catch (error) {
      console.error('Error fetching collections:', error);
      throw error;
    }
  };

  const handleCommunityClick = (id) => {
    goToCommunity(id); 
  };

  const handleUserClick = (id) => {
    goToUser(id); 
  };

  const handleCollectionCreated = (newCollection) => {
    setCollections([...collections, newCollection]);
  };

  const handleCollectionClick = (collection) => {
    console.log("Collection clicked:", collection);
    setSelectedCollection(collection);
  };

  return (
    <div className="sidebar">
      {isLoggedIn ? (
        <div>
          {isLoading && <p>Loading...</p>}
          {error && <p className="error">{error}</p>}

          <div className="tab">
            <h2>Your Communities</h2>
            <button onClick={() => setIsCommunitiesOpen(!isCommunitiesOpen)}>
              {isCommunitiesOpen ? 'Close Communities' : 'Open Communities'}
            </button>
            {isCommunitiesOpen && (
              <ul>
                {communities.map(community => (
                  <li key={community.id} onClick={() => handleCommunityClick(community.id)}>
                    {community.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="tab">
            <h2>Your Users</h2>
            <button onClick={() => setIsUsersOpen(!isUsersOpen)}>
              {isUsersOpen ? 'Close Users' : 'Open Users'}
            </button>
            {isUsersOpen && (
              <ul>
                {users.map(user => (
                  <li key={user.id} onClick={() => handleUserClick(user.id)}>
                    {user.username}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="tab">
            <h2>Your Collections</h2>
            <button onClick={() => setIsCollectionsOpen(!isCollectionsOpen)}>
              {isCollectionsOpen ? 'Close Collections' : 'Open Collections'}
            </button>
            {isCollectionsOpen && (
              <ul>
                {collections.map(collection => (
                  <li key={collection.id} onClick={() => handleCollectionClick(collection)}>
                    {collection.name}
                  </li>
                ))}
                <li>
                  <button onClick={() => setIsCreatingCollection(true)}>Create Collection</button>
                </li>
              </ul>
            )}
          </div>
        </div>
      ) : (
        <div>
          <h2>Welcome</h2>
          <p>Please log in to see your communities.</p>
        </div>
      )}
      {isCreatingCollection && (
        <CreateCollectionForm
          onClose={() => setIsCreatingCollection(false)}
          onCollectionCreated={handleCollectionCreated}
        />
      )}
      {selectedCollection && (
        <CollectionViewModal
          collection={selectedCollection}
          onClose={() => setSelectedCollection(null)}
        />
      )}
    </div>
  );
}

export default SideBar;