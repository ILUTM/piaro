import React, { useEffect, useState, useCallback } from 'react';
import PublicationsList from '../../components/SharedElements/PublicationsList';
import { usePublicationLike } from '../../utils/usePublicationLike';
import '../../sharedStyles/PageCommonStyle.css';

const HomePage = () => {
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  
  const { 
    publications, 
    setPublications, 
    contentTypeId, 
    handleLikeToggle 
  } = usePublicationLike();

  const fetchPublications = useCallback(async (page) => {
    try {
      setIsFetching(true);
      const response = await fetch(`http://127.0.0.1:8000/api/publications/all_publications/?page=${page}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      // For the first page, replace the publications
      // For subsequent pages, append to the existing publications
      setPublications(prev => page === 1 ? data.results : [...prev, ...data.results]);
      
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

  const loadMore = useCallback(() => {
    if (hasMore && !isFetching) {
      setPageNumber(prev => prev + 1);
    }
  }, [hasMore, isFetching]);

  return (
    <div className="page-wrapper">
      <h2>Newest Publications</h2>
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
      {isFetching && <div>Loading more publications...</div>}
    </div>
  );
};

export default HomePage;