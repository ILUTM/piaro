import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../sharedStyles/PublicationList.css';
import LikeComponent from '../Like/LikeComponent'; 
import { fetchContentTypeId } from '../../utils/ContentTypes';  // A utility to fetch content type IDs

const PublicationListItem = ({
  publication,
  index,
  lastPublicationElementRef,
}) => {
  const [showMore, setShowMore] = useState(false);
  const [contentTypeId, setContentTypeId] = useState(null);
  const [visibleHashtags, setVisibleHashtags] = useState([]);
  const hashtagsContainerRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchContentType = async () => {
      const contentTypeId = await fetchContentTypeId('publication');
      setContentTypeId(contentTypeId);
    };
    fetchContentType();
  }, []);

  useEffect(() => {
    if (hashtagsContainerRef.current) {
      const hashtagElements = publication.hashtags.map((hashtag, index) => (
        <li key={index} className="hashtag" onClick={() => handleHashtagClick(hashtag.name)}>
          {hashtag.name}
        </li>
      ));
      
      const containerWidth = hashtagsContainerRef.current.offsetWidth;
      let widthSum = 0;
      const visible = [];
      let showMoreNeeded = false;

      for (let i = 0; i < hashtagElements.length; i++) {
        widthSum += hashtagElements[i].offsetWidth;
        if (widthSum + (i * 10) > containerWidth) {
          showMoreNeeded = true;
          visible.push(
            <li key="show-more" className="hashtag" onClick={handleShowMore}>
              Show more
            </li>
          );
          break;
        }
        visible.push(hashtagElements[i]);
      }

      setVisibleHashtags(visible);

      if (!showMoreNeeded) {
        setVisibleHashtags(hashtagElements);
      }
    }
  }, [publication.hashtags, showMore]);

  const handleShowMore = () => setShowMore(!showMore);

  const handleHashtagClick = (hashtag) => {
    navigate(`/search?hashtags=${hashtag}`);
  };

  const handlePublicationClick = (id) => {
    navigate(`/Publication/${id}`);
  };

  const handleUserClick = (id) => {
    navigate(`/user/${id}`);
  };

  const handleCommunityClick = (id) => {
    navigate(`/community/${id}`);
  };

  return (
    <li ref={lastPublicationElementRef} key={publication.id} className="publication-container">
      <div className="publication-header">
        <p className="publication-author" onClick={() => handleUserClick(publication.author_id)}>
          {publication.author}
        </p>
        <p className="publication-community" onClick={() => handleCommunityClick(publication.community)}>
          {publication.community_name}
        </p>
        <p className="publication-date">{new Date(publication.date_posted).toLocaleString()}</p>
      </div>

      <h3 className="publication-title" onClick={() => handlePublicationClick(publication.id)}>
        {publication.title}
      </h3>

      <div className="publication-content-container">
        <div
          className="publication-content"
          style={{ maxHeight: showMore ? 'none' : '500px', overflow: 'hidden' }}
          dangerouslySetInnerHTML={{ __html: publication.content }}
        />
        {publication.content.length > 500 && (
          <button className="show-more-button" onClick={handleShowMore}>
            {showMore ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>

      <div className="publication-footer">
        <div className="like-container">
          {contentTypeId && <LikeComponent contentType={contentTypeId} objectId={publication.id} /> }
        </div>
        <div className="publication-hashtags-container" ref={hashtagsContainerRef}>
          <ul className="publication-hashtags">
            {visibleHashtags}
          </ul>
        </div>
      </div>
    </li>
  );
};

export default PublicationListItem;
