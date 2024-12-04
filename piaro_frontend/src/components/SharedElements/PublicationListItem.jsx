import React, { useState } from 'react';
import '../../sharedStyles/PublicationList.css';

const PublicationListItem = ({ 
  publication, 
  index, 
  lastPublicationElementRef, 
  handlePublicationClick,
  handleUserClick,
  }) => {
  const [showMore, setShowMore] = useState(false);
  const [showAllHashtags, setShowAllHashtags] = useState(false);

  const handleShowMore = () => setShowMore(!showMore);
  const handleShowAllHashtags = () => setShowAllHashtags(!showAllHashtags);

  return (
    <li
      ref={lastPublicationElementRef}
      key={publication.id}
      className="publication-container"
    >
      <div className="publication-header">
        <p className="publication-author" onClick={() => handleUserClick(publication.author.id)}>
          {publication.author}
        </p>
        <p className="publication-community">{publication.community}</p>
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
            <li key={index} className="hashtag">{hashtag.name}</li>
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

