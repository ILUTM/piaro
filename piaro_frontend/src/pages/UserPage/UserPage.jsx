import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import PublicationListItem from '../../components/SharedElements/PublicationListItem';
import useInfiniteScroll from '../../components/SharedElements/useInfiniteScroll';
import { fetchContentType, subscribe, unsubscribe, checkSubscription, toggleNotifications } from '../../utils/subscriptionUtils';
import '../../sharedStyles/UserPage.css';
import defaultProfilePhoto from '../../static/default_profile_photo.png'; // Import the default profile photo

const UserPage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [publications, setPublications] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [sendNotifications, setSendNotifications] = useState(false);
  const [contentType, setContentType] = useState(0);

  const fetchUserData = useCallback(() => {
    fetch(`http://127.0.0.1:8000/api/users/${id}/get_user/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      setUser(data);
    })
    .catch(error => {
      console.error('There was an error fetching user data', error);
    });
  }, [id]);

  const fetchUserPublications = useCallback(async (page) => {
    try {
      setIsFetching(true);
      const response = await fetch(`http://127.0.0.1:8000/api/publications/by-user/${id}/?page=${page}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setPublications(prev => [...prev, ...data.results]);
      setHasMore(data.next !== null);
    } catch (error) {
      console.error('There was an error fetching publications', error);
    } finally {
      setIsFetching(false);
    }
  }, [id]);

  const checkSubscriptionStatus = useCallback(async () => {
    try {
      const data = await checkSubscription(contentType, user.id);
      setIsSubscribed(data.subscribed);
      setSendNotifications(data.send_notifications);
    } catch (error) {
      console.error('There was an error checking the subscription status:', error);
    }
  }, [contentType, user]);

  const handleSubscribe = async () => {
    try {
      await subscribe(contentType, user.id);
      setIsSubscribed(true);
      checkSubscriptionStatus();
    } catch (error) {
      console.error('There was an error subscribing to the user', error);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await unsubscribe(contentType, user.id);
      setIsSubscribed(false);
      checkSubscriptionStatus();
    } catch (error) {
      console.error('There was an error unsubscribing from the user', error);
    }
  };

  const handleToggleNotifications = async () => {
    try {
      const data = await toggleNotifications(contentType, user.id);
      setSendNotifications(data.send_notifications);
    } catch (error) {
      console.error('There was an error toggling notifications', error);
    }
  };

  const lastPublicationElementRef = useInfiniteScroll(hasMore, isFetching, setPageNumber);

  useEffect(() => {
    fetchUserData();
    fetchUserPublications(pageNumber);
    fetchContentType('user').then(setContentType);
  }, [id, pageNumber, fetchUserPublications, fetchUserData]);

  useEffect(() => {
    if (user && contentType) {
      checkSubscriptionStatus();
    }
  }, [user, contentType, checkSubscriptionStatus]);

  return (
    <div className="user-container">
      {user ? (
        <>
          <div className="user-header">
            <div>
              <h2>{user.username}</h2>
              <div className="profile-photo-section">
                <img
                  src={user.profile_photo || defaultProfilePhoto} // Use default photo if profile photo is absent
                  alt="Profile"
                  className="profile-photo"
                />
              </div>
              <p>{user.tg_contact}</p>
            </div>
            <div className="subscription-buttons">
              {isSubscribed ? (
                <button onClick={handleUnsubscribe}>Subscribed</button>
              ) : (
                <button onClick={handleSubscribe}>Subscribe</button>
              )}
              <button onClick={handleToggleNotifications} disabled={!isSubscribed}>
                {sendNotifications ? 'Notifications On' : 'Notifications Off'}
              </button>
            </div>
          </div>
          <h2>Publications</h2>
          <ul className="publications-list">
            {publications.map((publication, index) => (
              <PublicationListItem
                key={publication.id}
                publication={publication}
                index={index}
                lastPublicationElementRef={index === publications.length - 1 ? lastPublicationElementRef : null}
              />
            ))}
          </ul>
        </>
      ) : (
        <p>Loading user data...</p>
      )}
    </div>
  );
};

export default UserPage;
