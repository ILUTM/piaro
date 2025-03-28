import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import PublicationsList from '../../components/SharedElements/PublicationsList';
import { usePublicationLike } from '../../utils/usePublicationLike';
import '../../sharedStyles/PageCommonStyle.css';

const SearchPublication = () => {
  const location = useLocation();
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

  const loadMore = useCallback(() => {
    if (hasMore && !isFetching) {
      setPageNumber(prev => prev + 1);
    }
  }, [hasMore, isFetching]);

  const fetchPublications = useCallback(async (page) => {
    try {
      setIsFetching(true);
      const params = new URLSearchParams(location.search);
      const response = await fetch(
        `http://127.0.0.1:8000/api/publications/search/?hashtags=${params.get('hashtags') || ''}&page=${page}&title=${params.get('query') || ''}`
      );
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setPublications(prev => page === 1 ? data.results : [...prev, ...data.results]);
      setHasMore(data.next !== null);
    } catch (error) {
      setError('Failed to fetch search results');
      console.error('Error:', error);
    } finally {
      setIsFetching(false);
    }
  }, [location.search, setPublications]);

  useEffect(() => {
    setPageNumber(1);
    fetchPublications(1);
  }, [location.search]);

  useEffect(() => {
    if (pageNumber > 1) fetchPublications(pageNumber);
  }, [pageNumber]);

  return (
    <div className="page-wrapper">
      <div className="publication-list-wrapper">
        <h2>Search Results for Publications</h2>
        {error && <p className="error">{error}</p>}
        
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

export default SearchPublication;