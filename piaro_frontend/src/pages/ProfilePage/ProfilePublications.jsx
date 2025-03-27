import React, { useEffect, useState, useCallback } from 'react';
import PublicationsList from '../../components/SharedElements/PublicationsList';
import { usePublicationLike } from '../../utils/usePublicationLike';
import useInfiniteScroll from '../../components/SharedElements/useInfiniteScroll';
import '../../sharedStyles/PublicationList.css';
import '../../sharedStyles/ProfilePage.css';

const MyPublicationsPage = () => {
  const [error, setError] = useState('');
  
  const { 
    publications, 
    setPublications, 
    contentTypeId, 
    handleLikeToggle
  } = usePublicationLike();

  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const lastPublicationElementRef = useInfiniteScroll(hasMore, isFetching, () => {
    setPageNumber(prev => prev + 1);
  });

  const fetchPublications = useCallback(async (page) => {
    const token = localStorage.getItem('token');
    try {
      setIsFetching(true);
      const response = await fetch(`http://127.0.0.1:8000/api/publications/my_publications/?page=${page}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setPublications(prev => [...prev, ...data.results]);
      setHasMore(data.next !== null);
    } catch (error) {
      setError('Fetching failed. It will be repaired soon');
      console.error('Error:', error);
    } finally {
      setIsFetching(false);
    }
  }, [setPublications]);

  useEffect(() => {
    fetchPublications(pageNumber);
  }, [pageNumber, fetchPublications]);

  return (
    <div>
      <h1>My Publications</h1>
      {error && <p>{error}</p>}
      <ul className="publications-list">
        {publications.map((publication, index) => (
          <PublicationsList
          publications={publications}
          lastPublicationElementRef={lastPublicationElementRef}
          contentTypeId={contentTypeId}
          onLikeToggle={handleLikeToggle}
        />
        ))}
      </ul>
    </div>
  );
};

export default MyPublicationsPage;

