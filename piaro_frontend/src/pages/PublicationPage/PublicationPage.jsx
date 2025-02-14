import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CommentField from './CommentField/CommentField';
import LikeComponent from '../../components/Like/LikeComponent';
import { fetchContentTypeId } from '../../utils/ContentTypes';
import '../../sharedStyles/PublicationPage.css';

const PublicationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [publication, setPublication] = useState(null);
  const [error, setError] = useState('');
  const [contentTypeId, setContentTypeId] = useState(null);

  useEffect(() => {
    fetchPublication();
  }, [id]);

  useEffect(() => {
    const fetchContentType = async () => {
      const contentTypeId = await fetchContentTypeId('publication');
      setContentTypeId(contentTypeId);
    };
    fetchContentType();
  }, []);

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
        updateLastVisitedPublications(data); 
      })
      .catch(error => {
        console.error('There was an error fetching the publication', error);
        setError('Fetching publication failed. It will be repaired soon.');
      });
  };

  const updateLastVisitedPublications = (publication) => {
    const storedVisited = JSON.parse(localStorage.getItem('lastVisitedPublications')) || [];
    const updatedVisited = [publication, ...storedVisited.filter(pub => pub.id !== publication.id)].slice(0, 10);
    localStorage.setItem('lastVisitedPublications', JSON.stringify(updatedVisited));
  };

  if (!publication) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const handleCommunityClick = () => {
    navigate(`/community/${publication.community}`);
  };

  return (
    <div className="publication-page-wrapper">
      <h2 className="publication-title">{publication.title}</h2>
      <p className="publication-community">
        Community: 
        <span className="clickable" onClick={handleCommunityClick}>
          {publication.community_name}
        </span>
      </p>
      <ul className="publication-details">
        <li key={publication.id}>
          <p className="publication-author">Author: {publication.author}</p>
          <div className="publication-content" dangerouslySetInnerHTML={{ __html: publication.content }} />
          <p className="publication-date">Posted on: {new Date(publication.date_posted).toLocaleString()}</p>
        </li>
      </ul>
      {contentTypeId && <LikeComponent contentType={contentTypeId} objectId={publication.id} />}
      <div className="comment-field-wrapper">
        <CommentField publicationId={id} />
      </div>
    </div>
  );
};

export default PublicationPage;