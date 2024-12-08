import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import PublicationListItem from '../../components/SharedElements/PublicationListItem';
import useInfiniteScroll from '../../components/SharedElements/useInfiniteScroll';

const UserPage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [publications, setPublications] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

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
        console.error('There was an error fetching the publication', error);
      });
    }, [id]);

    const fetchPublications = useCallback(async (page) => {
      try {
        setIsFetching(true);
        console.log('Fetching publications for the community page:', page);
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
        console.log('fetched data', data);
        setPublications(prev => [...prev, ...data.results]);
        setHasMore(data.next !== null);
      } catch (error) {
        console.error('There was an error fetching publications', error);
      } finally {
        setIsFetching(false);
      }
    }, [id]);

    const lastPublicationElementRef = useInfiniteScroll(hasMore, isFetching, setPageNumber);

    useEffect(() => {
      fetchUserData();
      fetchPublications(pageNumber);
    }, [id, pageNumber, fetchPublications, fetchUserData]);

    return (
      <div className="user-container">
        {user ? (
          <>
            <h2>{user.username}</h2>
            <div className="profile-photo-section">
              {user.profile_photo ? (
                <img src={user.profile_photo} alt="Profile" className="profile-photo" />
              ) : (
                <p className="no-photo">No profile photo</p>
              )}
            </div>
            <p>{user.tg_contact}</p>
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
          <p>Loading user data...</p> // Loading state
        )}
      </div>
    );
  };
  
  export default UserPage;