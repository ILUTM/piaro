import React from 'react';
import '../../sharedStyles/PublicationList.css';

const PublicationListElement = React.forwardRef(({ publication, onClick }, ref) => {
  return (
    <li ref={ref} className="publication-container">
      <p className="publication-author">{publication.author}</p>
      <h3 className="publication-title" onClick={() => onClick(publication.id)}>{publication.title}</h3>
      <div className="publication-content" dangerouslySetInnerHTML={{ __html: publication.content }} />
      <p className="publication-date">{new Date(publication.date_posted).toLocaleString()}</p>
    </li>
  );
});

export default PublicationListElement;
