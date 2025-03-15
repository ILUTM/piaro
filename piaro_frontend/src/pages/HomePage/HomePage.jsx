import React, { useEffect, useState, useCallback } from 'react';
import PublicationListItem from '../../components/SharedElements/PublicationListItem';
import useInfiniteScroll from '../../components/SharedElements/useInfiniteScroll';
import { fetchContentTypeId } from '../../utils/ContentTypes'; 
import '../../sharedStyles/PageCommonStyle.css';

const HomePage = () => {
  const [publications, setPublications] = useState([]);
  const [error, setError] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [contentTypeId, setContentTypeId] = useState(null); 

  useEffect(() => {
    const fetchContentType = async () => {
      const id = await fetchContentTypeId('publication');
      setContentTypeId(id);
    };
    fetchContentType();
  }, []);

  const fetchPublications = useCallback(async (page) => {
    try {
      setIsFetching(true);
      console.log('Fetching publications from page:', page);
      const response = await fetch(`http://127.0.0.1:8000/api/publications/all_publications/?page=${page}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Fetched data:', data);
      setPublications(prev => [...prev, ...data.results]);
      setHasMore(data.next !== null);
    } catch (error) {
      console.error('There was an error fetching publications', error);
      setError('Fetching publications failed. It will be repaired soon');
      console.log(error);
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchPublications(pageNumber);
  }, [pageNumber, fetchPublications]);

  const handleLikeToggle = (publicationId, likes, dislikes, userLikeStatus) => {
    setPublications(prevPublications =>
      prevPublications.map(publication =>
        publication.id === publicationId
          ? {
              ...publication,
              likes_count: likes,
              dislikes_count: dislikes,
              user_like_status: userLikeStatus,
            }
          : publication
      )
    );
  };

  const lastPublicationElementRef = useInfiniteScroll(hasMore, isFetching, setPageNumber);

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
              lastPublicationElementRef={index === publications.length - 1 ? lastPublicationElementRef : null}
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