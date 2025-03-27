import React, { useEffect, useState, useCallback } from 'react';
import PublicationListItem from '../../components/SharedElements/PublicationListItem';
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
    <div className="page-wrapper">
      <h2>Newest Publications</h2>
      {error && <p className="error">{error}</p>}
      <div className="publication-list-wrapper">
        <ul className="publications-list">
          {publications.map((publication, index) => (
            <PublicationListItem
              key={publication.id}
              publication={publication}
              index={index}
              contentTypeId={contentTypeId}
              onLikeToggle={handleLikeToggle} 
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HomePage;