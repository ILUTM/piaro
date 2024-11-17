import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PublicationListItem from '../../components/SharedElements/PublicationListItem';
import useInfiniteScroll from '../../components/SharedElements/useInfiniteScroll';
import '../../sharedStyles/PublicationList.css'; 
import '../../sharedStyles/SearchPage.css'; 

const SearchPublication = ({ query, hashtags }) => {
  const [publications, setPublications] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchPublications = useCallback(async (page) => {
    try {
      setIsFetching(true);
      const params = new URLSearchParams(location.search);
      const hashtags = params.get('hashtags') || '';
      const query = params.get('query') || '';
      const response = await fetch(`http://127.0.0.1:8000/api/publications/search/?hashtags=${hashtags}&page=${page}&title=${query}`, {
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
    } finally {
      setIsFetching(false);
    }
  }, [location.search]);

  const lastPublicationElementRef = useInfiniteScroll(hasMore, isFetching, setPageNumber);

  useEffect(() => {
    setPublications([]); 
    setPageNumber(1); 
    fetchPublications(1); 
  }, [pageNumber, fetchPublications]);

  useEffect(() => {
    if (pageNumber > 1) {
      fetchPublications(pageNumber);
    }
  }, [pageNumber, fetchPublications])

  const handlePublicationClick = (id) => {
    navigate(`/Publication/${id}`);
  };

  const handleUserClick = (id) => {
    navigate(`/user/${id}`);
  };

  return (
    <div className="search-page-wrapper">
      <div className="search-publications-wrapper">
        <h2>Search Results for Publications</h2>
        {publications.length > 0 ? (
          <ul className="publications-list">
            {publications.map((publication, index) => (
              <PublicationListItem
                key={publication.id}
                publication={publication}
                index={index}
                lastPublicationElementRef={index === publications.length - 1 ? lastPublicationElementRef : null}
                handlePublicationClick={handlePublicationClick}
                handleUserClick={handleUserClick}
              />
            ))}
          </ul>
        ) : (
          <p>No results found.</p>
        )}
      </div>
  </div>   
  );
};

export default SearchPublication;
