import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CommentField from './CommentField/CommentField';
import LikeComponent from '../../components/Like/LikeComponent';
import ImageModal from '../../components/SharedElements/ImageModal'; 
import '../../sharedStyles/PublicationPage.css';

const PublicationPage = ({ contentTypeId }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [publication, setPublication] = useState(null);
  const [error, setError] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); 
  const [selectedImage, setSelectedImage] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    fetchPublication();
  }, [slug]);

  // Fetch publication data
  const fetchPublication = () => {
    fetch(`http://127.0.0.1:8000/api/publications/get-publication/${slug}/`, {
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

  // Update last visited publications in localStorage
  const updateLastVisitedPublications = (publication) => {
    const storedVisited = JSON.parse(localStorage.getItem('lastVisitedPublications')) || [];
    const updatedVisited = [publication, ...storedVisited.filter(pub => pub.id !== publication.id)].slice(0, 10);
    localStorage.setItem('lastVisitedPublications', JSON.stringify(updatedVisited));
  };

  useEffect(() => {
    if (contentRef.current) {
      const images = contentRef.current.querySelectorAll('img');
      images.forEach((img) => {
        img.style.cursor = 'pointer'; 
        img.addEventListener('click', handleImageClick);
      });

      return () => {
        images.forEach((img) => {
          img.removeEventListener('click', handleImageClick);
        });
      };
    }
  }, [publication?.content]); 

  const handleImageClick = (e) => {
    e.stopPropagation(); 
    setSelectedImage(e.target.src); 
    setIsImageModalOpen(true); 
  };

  const handleCommunityClick = () => {
    navigate(`/community/${publication.community_slug}`);
  };
  

  if (!publication) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

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
          <div
            className="publication-content"
            dangerouslySetInnerHTML={{ __html: publication.content }}
            ref={contentRef} // Attach ref to the content
          />
          <p className="publication-date">Posted on: {new Date(publication.date_posted).toLocaleString()}</p>
        </li>
      </ul>
      {contentTypeId && <LikeComponent contentType={contentTypeId} objectId={publication.id} />}
      <div className="comment-field-wrapper">
        <CommentField publicationId={publication.id} contentTypeId={contentTypeId} />
      </div>

      {/* Image Modal */}
      {isImageModalOpen && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setIsImageModalOpen(false)}
        />
      )}
    </div>
  );
};

export default PublicationPage;