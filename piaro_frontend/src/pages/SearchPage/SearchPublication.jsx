import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PublicationsList from '../../components/SharedElements/PublicationsList';
import { usePublicationLike } from '../../utils/usePublicationLike';
import useInfiniteScroll from '../../components/SharedElements/useInfiniteScroll';
import '../../sharedStyles/PageCommonStyle.css';

const SearchPublication = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
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

  const goToPublication = (slug) => navigate(`/publication/${slug}`);
  const goToUser = (id) => navigate(`/user/${id}`);
  const goToCommunity = (slug) => navigate(`/community/${slug}`);

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

  const handlePublicationClick = (slug) => {
    goToPublication(slug); 
  };

  const handleUserClick = (id) => {
    goToUser(id); 
  };

  const handleCommunityClick = (slug) => {
    goToCommunity(slug); 
  };

  return (
    <div className="page-wrapper">
      <div className="publication-list-wrapper">
        <h2>Search Results for Publications</h2>
        {publications.length > 0 ? (
          <ul className="publications-list">
            {publications.map((publication, index) => (
              <PublicationsList
              publications={publications}
              lastPublicationElementRef={lastPublicationElementRef}
              contentTypeId={contentTypeId}
              onLikeToggle={handleLikeToggle}
              handlePublicationClick={goToPublication}
              handleUserClick={goToUser}
              handleCommunityClick={goToCommunity}
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