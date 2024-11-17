import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicationListItem from '../../components/SharedElements/PublicationListItem';
import useInfiniteScroll from '../../components/SharedElements/useInfiniteScroll';
import '../../sharedStyles/PublicationList.css';

const MyPublicationsPage = () => {
  const [publications, setPublications] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchPublications = useCallback(async (page) => {
    const token = localStorage.getItem('token');
    try {
      setIsFetching(true);
      const response = await fetch(`http://127.0.0.1:8000/api/publications/my_publications/?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setPublications(prev => [...prev, ...data.results]);
      setHasMore(data.next !== null);
    } catch (error) {
      console.error('There was an error fetching the publications!', error);
      setError('Fetching publications failed. It will be repaired soon');
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchPublications(pageNumber);
  }, [pageNumber, fetchPublications]);

  const lastPublicationElementRef = useInfiniteScroll(hasMore, isFetching, setPageNumber);



  const handlePublicationClick = (id) => {
    navigate(`/publication/${id}`);
  };

  return (
    <div>
      <h1>My Publications</h1>
      {error && <p>{error}</p>}
      <ul className="publications-list">
        {publications.map((publication, index) => (
          <PublicationListItem
            key={publication.id}
            publication={publication}
            index={index}
            lastPublicationElementRef={index === publications.length - 1 ? lastPublicationElementRef : null}
            handlePublicationClick={handlePublicationClick}
          />
        ))}
      </ul>
    </div>
  );
};

export default MyPublicationsPage;

