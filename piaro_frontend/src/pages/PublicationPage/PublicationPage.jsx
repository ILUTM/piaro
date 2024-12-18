import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CommentField from './CommentField/CommentField';

const PublicationPage = () => {
  const { id } = useParams();
  const [publication, setPublication] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPublication();
  }, [id]);

  const fetchPublication = () => {
    fetch(`http://127.0.0.1:8000/api/publications/${id}/get_publication/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      setPublication(data);
    })
    .catch(error => {
      console.error('There was an error fetching the publication', error);
      setError('Fetching publication failed. It will be repaired soon.');
    });
  };

  if (!publication) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>{publication.title}</h2>
      <ul>
        <li key={publication.id}>
          <p>{publication.author}</p>
          <div dangerouslySetInnerHTML={{ __html: publication.content }} />
          <p>{new Date(publication.date_posted).toLocaleString()}</p>
        </li>
      </ul>
      <div className="comment-field-wrapper">
        <CommentField publicationId={id} />
      </div>
    </div>
  );
};

export default PublicationPage;
