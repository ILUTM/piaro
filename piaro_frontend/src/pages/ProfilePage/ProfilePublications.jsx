import React, { useEffect, useState, useCallback } from 'react';
import PublicationsList from '../../components/SharedElements/PublicationsList';
import { usePublicationLike } from '../../utils/usePublicationLike';
import '../../sharedStyles/PageCommonStyle.css';

const MyPublicationsPage = () => {
  const [error, setError] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  
  const { 
    publications, 
    setPublications, 
    contentTypeId, 
    handleLikeToggle 
  } = usePublicationLike();

  const loadMore = useCallback(() => {
    if (hasMore && !isFetching) {
      setPageNumber(prev => prev + 1);
    }
  }, [hasMore, isFetching]);

  const fetchPublications = useCallback(async (page) => {
    const token = localStorage.getItem('token');
    try {
      setIsFetching(true);
      const response = await fetch(`http://127.0.0.1:8000/api/publications/my_publications/?page=${page}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setPublications(prev => page === 1 ? data.results : [...prev, ...data.results]);
      setHasMore(data.next !== null);
    } catch (error) {
      setError('Failed to load publications. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsFetching(false);
    }
  }, [setPublications]);

  useEffect(() => {
    fetchPublications(pageNumber);
  }, [pageNumber, fetchPublications]);

  return (
    <div className="page-wrapper">
      <h1>My Publications</h1>
      {error && <p className="error">{error}</p>}
      <div className="publication-list-wrapper">
        <PublicationsList
          publications={publications}
          onLoadMore={loadMore}
          hasMore={hasMore}
          isFetching={isFetching}
          contentTypeId={contentTypeId}
          onLikeToggle={handleLikeToggle}
        />
      </div>
    </div>
  );
};

export default MyPublicationsPage;