import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PublicationListItem from '../../components/SharedElements/PublicationListItem';
import useInfiniteScroll from '../../components/SharedElements/useInfiniteScroll';
import { fetchContentType, subscribe, unsubscribe, checkSubscription, toggleNotifications } from '../../utils/subscriptionUtils';
import { fetchContentTypeId } from '../../utils/ContentTypes'; 
import '../../sharedStyles/PageCommonStyle.css';
import '../../sharedStyles/CommunityPage.css';

const CommunityPage = () => {
  const { slug } = useParams();
  const [community, setCommunity] = useState(null);
  const [publications, setPublications] = useState([]);
  const [error, setError] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const navigate = useNavigate();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [sendNotifications, setSendNotifications] = useState(false);
  const [contentType, setContentType] = useState(0);
  // contentType for publications
  const [contentTypeId, setContentTypeId] = useState(null);
    useEffect(() => {
      const fetchContentType = async () => {
        const id = await fetchContentTypeId('publication');
        setContentTypeId(id);
      };
      fetchContentType();
    }, []);

  const fetchCommunity = useCallback(() => {
    fetch(`http://127.0.0.1:8000/api/communities/details/${slug}/`, {
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
  }, [slug]);

  const fetchCommunityPublications = useCallback(async (page) => {
    try {
      setIsFetching(true);
      const response = await fetch(`http://127.0.0.1:8000/api/publications/by-community/${slug}/?page=${page}`, {
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
  }, [slug]);

  const checkSubscriptionStatus = useCallback(async () => {
    try {
      const data = await checkSubscription(contentType, community.id); 
      setIsSubscribed(data.subscribed);
      setSendNotifications(data.send_notifications);
    } catch (error) {
      console.error('There was an error checking the subscription status:', error);
    }
  }, [contentType, community]);

  const handleSubscribe = async () => {
    try {
      await subscribe(contentType, community.id); 
      setIsSubscribed(true);
      checkSubscriptionStatus();
    } catch (error) {
      console.error('There was an error subscribing to the community', error);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await unsubscribe(contentType, community.id);
      setIsSubscribed(false);
      checkSubscriptionStatus();
    } catch (error) {
      console.error('There was an error unsubscribing from the community', error);
    }
  };

  const handleToggleNotifications = async () => {
    try {
      const data = await toggleNotifications(contentType, community.id);
      setSendNotifications(data.send_notifications);
    } catch (error) {
      console.error('There was an error toggling notifications', error);
    }
  };

  const lastPublicationElementRef = useInfiniteScroll(hasMore, isFetching, setPageNumber);

  const navigateToCreatePublication = () => {
    navigate('/create-publication', { state: { community } });
  };

  useEffect(() => {
    fetchCommunity();
    fetchCommunityPublications(pageNumber);
    fetchContentType('community').then(setContentType);
  }, [slug, pageNumber, fetchCommunityPublications, fetchCommunity]);

  useEffect(() => {
    if (community && contentType) {
      checkSubscriptionStatus();
    }
  }, [community, contentType, checkSubscriptionStatus]);

  return (
    <div className="page-wrapper">
      {community ? (
        <>
          <img src={community.photo} alt={`${community.name}`} className="community-photo" />
          <div className="community-header">
            <h2>{community.name}</h2>
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
          <p>{community.description}</p>
        </>
      ) : (
        <p>Loading community details...</p>
      )}
      <button className="create-publication-button" onClick={navigateToCreatePublication}>Create New Publication</button>
      <h2>Publications in Community</h2>
      {error && <p className="error">{error}</p>}
      <div className="publication-list-wrapper">
        <ul className="publications-list">
          {publications.map((publication, index) => (
            <PublicationListItem
              key={publication.id}
              publication={publication}
              index={index}
              lastPublicationElementRef={index === publications.length - 1 ? lastPublicationElementRef : null}
              contentTypeId={contentTypeId}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CommunityPage;