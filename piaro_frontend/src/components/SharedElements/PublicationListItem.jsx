import React from 'react';

const PublicationListItem = ({ 
  publication, 
  index, 
  lastPublicationElementRef, 
  handlePublicationClick,
  handleUserClick,
  }) => {
  return (
    <li
      ref={lastPublicationElementRef}
      key={publication.id}
      className="publication-container"
    >
      <p className="publication-author" onClick={() => handleUserClick(publication.author_id)}>{publication.author}</p>
      <h3 className="publication-title" onClick={() => handlePublicationClick(publication.id)}>{publication.title}</h3>
      {/* <div className="publication-content" dangerouslySetInnerHTML={{ __html: publication.content }} /> */}
      <div>Content filler here</div>
      <p className="publication-date">{new Date(publication.date_posted).toLocaleString()}</p>
    </li>
  );
};

export default PublicationListItem;
