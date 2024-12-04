import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../sharedStyles/PublicationList.css';

const PublicationListItem = ({ 
  publication, 
  index, 
  lastPublicationElementRef, 
  handlePublicationClick,
  handleUserClick,
  handleCommunityClick,
  }) => {
  const [showMore, setShowMore] = useState(false);
  const [showAllHashtags, setShowAllHashtags] = useState(false);
  const navigate = useNavigate();

  const handleShowMore = () => setShowMore(!showMore);
  const handleShowAllHashtags = () => setShowAllHashtags(!showAllHashtags);

  const handleHashtagClick = (hashtag) => { 
    navigate(`/search?hashtags=${hashtag}`); 
  };

  return (
    <li
      ref={lastPublicationElementRef}
      key={publication.id}
      className="publication-container"
    >
      <div className="publication-header">
        <p className="publication-author" onClick={() => handleUserClick(publication.author_id)}>
          {publication.author}
        </p>
        <p className="publication-community" onClick={() => handleCommunityClick(publication.community)}>{publication.community_name}</p>
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
          <button onClick={handleShowMore}>
            {showMore ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>

      <div className="publication-footer">
        <ul className="publication-hashtags">
          {publication.hashtags.slice(0, showAllHashtags ? publication.hashtags.length : 2).map((hashtag, index) => (
            <li key={index} className="hashtag" onClick={() => handleHashtagClick(hashtag.name)}>{hashtag.name}</li>
          ))}
          {publication.hashtags.length > 2 && (
            <button onClick={handleShowAllHashtags}>
              {showAllHashtags ? 'Show Less Hashtags' : 'See All Hashtags'}
            </button>
          )}
        </ul>
      </div>
    </li>
  );
};

export default PublicationListItem;

