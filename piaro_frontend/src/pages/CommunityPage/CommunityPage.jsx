import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PublicationListItem from '../../components/SharedElements/PublicationListItem';
import useInfiniteScroll from '../../components/SharedElements/useInfiniteScroll';


const CommunityPage = () => {
  const { id } = useParams();
  const [community, setCommunity] = useState(null);
  // Publications fetching and paginator
  const [publications, setPublications] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  // end 
  const navigate = useNavigate();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [sendNotifications, setSendNotifications] = useState(false);
  const [contentType, setContentType] = useState(0);

  const fetchContentType = () => {
    fetch('http://127.0.0.1:8000/api/utils/content_types/')
    .then(response => response.json())
    .then(data => {
      setContentType(data.community);
    })
    .catch(error => console.error('Error fetching content types:', error));
  };

  const fetchCommunity = useCallback(() => {
    fetch(`http://127.0.0.1:8000/api/communities/${id}/details/`, {
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
      setCommunity(data);
    })
    .catch(error => {
      console.error("There was an error fetching community data!", error);
    });
  }, [id]);

  const fetchPublications = useCallback(async (page) => {
    try {
      setIsFetching(true);
      console.log('Fetching publications for the community page:', page);
      const response = await fetch(`http://127.0.0.1:8000/api/publications/by-community/${id}/?page=${page}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('fetched data', data);
      setPublications(prev => [...prev, ...data.results]);
      setHasMore(data.next !== null);
    } catch (error) {
      console.error('There was an error fetching publications', error);
    } finally {
      setIsFetching(false);
    }
  }, [id]);

  const handleSubscribe = () => {
    const token = localStorage.getItem('token');

    fetch('http://127.0.0.1:8000/api/subscriptions/subscribe/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content_type: contentType,
        object_id: community.id,
        send_notifications: false
      }),
    })
    .then(response => {
      if (response.status === 401) {
        alert('Login to subscribe');
        return;
      };
      if (!response.ok) {
        throw new Error('network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Subscription successful:', data);
      setIsSubscribed(true);
    })
    .catch(error => {
      console.error('There was an error subscribing to the community', error);
    });
  };

  const handleUnsubscribe = () => {
    const token = localStorage.getItem('token');
    fetch(`http://127.0.0.1:8000/api/subscriptions/unsubscribe/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content_type: contentType,
        object_id: community.id,
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      setIsSubscribed(false);
    })
    .catch(error => {
      console.error('There was an error unsubscribing from the community', error);
    });
  };

  const checkSubscription = () => {
    const token = localStorage.getItem('token');
    fetch(`http://127.0.0.1:8000/api/subscriptions/check_subscription/?content_type=${contentType}&object_id=${community.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
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
      setIsSubscribed(data.subscribed);
    })
    .catch(error => {
      console.error('There was an error checking the subscription status:', error);
    });
  };

  const toggleNotifications = () => {
    const token = localStorage.getItem('token');
    fetch('http://127.0.0.1:8000/api/subscriptions/toggle_notifications/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content_type: contentType,
        object_id: community.id,
      })
    })
    .then( response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('toggled notifications:', data);
      setSendNotifications(data.send_notifications);
    })
    .catch(error => {
      console.error('There was an error toggling notifications:', error);
    })
  }

  const lastPublicationElementRef = useInfiniteScroll(hasMore, isFetching, setPageNumber);

  const navigateToCreatePublication = () => {
    navigate('/create-publication', { state: { community } });
  };

  useEffect(() => {
    fetchCommunity();
    fetchPublications(pageNumber);
    fetchContentType();
  }, [id, pageNumber, fetchPublications, fetchCommunity]);

  useEffect(() => {
    if (community && contentType) {
      checkSubscription();
    }
  }, [community, contentType, checkSubscription]);

  return (
    <div>
      {community ? (
        <div>
          <h2>{community.name}</h2>
          <img src={community.photo} alt={`${community.name} photo`} />
          <p>{community.description}</p>
          {isSubscribed ? (
            <div>
              <button onClick={handleUnsubscribe}>Unsubscribe</button>
              <button onClick={toggleNotifications}> 
                {sendNotifications ? 'Disable Notifications' : 'Enable Notifications'} 
              </button>
            </div>
          ) : (
            <button onClick={handleSubscribe}>Subscribe</button>
          )}
        </div>
      ) : (
        <p>Loading community details...</p>
      )}
      <button onClick={navigateToCreatePublication}>Create New Publication</button>
      <h2>Publications in Community</h2>
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
    </div>
  );
};

export default CommunityPage;
