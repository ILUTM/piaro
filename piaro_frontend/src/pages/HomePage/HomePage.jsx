import React, { useEffect, useState, useCallback } from 'react';
import PublicationListItem from '../../components/SharedElements/PublicationListItem';
import useInfiniteScroll from '../../components/SharedElements/useInfiniteScroll';
import '../../sharedStyles/PublicationList.css'; 
import '../../sharedStyles/HomePage.css';

const HomePage = () => {
  const [publications, setPublications] = useState([]);
  const [error, setError] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

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

  const lastPublicationElementRef = useInfiniteScroll(hasMore, isFetching, setPageNumber);

  return (
    <div className="homepage-wrapper">
      <h2>Newest Publications</h2>
      {error && <p>{error}</p>}
      <div className="publication-list-wrapper">
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
    </div>
  );
};

export default HomePage;

