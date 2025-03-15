import React, { useState, useRef, useEffect } from 'react';
import { useNavigation } from '../../utils/navigation'; 
import '../../sharedStyles/PublicationList.css';
import LikeComponent from '../Like/LikeComponent';
import { fetchMyCollections } from '../../utils/collectionUtils';
import AddToCollectionModal from './AddToCollectionModal';
import ImageModal from './ImageModal'; 

const PublicationListItem = ({
  publication,
  index,
  lastPublicationElementRef,
  contentTypeId, 
}) => {
  const [showMore, setShowMore] = useState(false);
  const [visibleHashtags, setVisibleHashtags] = useState([]);
  const [isAddingToCollection, setIsAddingToCollection] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); 
  const [selectedImage, setSelectedImage] = useState(null); 
  const [userCollections, setUserCollections] = useState([]);
  const [needsShowMore, setNeedsShowMore] = useState(false); 
  const hashtagsContainerRef = useRef(null);
  const contentRef = useRef(null);
  const { likes_count, dislikes_count, user_like_status } = publication;

  const { goToSearch, goToUser, goToCommunity, goToPublication } = useNavigation(); 

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

  useEffect(() => {
    if (contentRef.current) {
      const images = contentRef.current.querySelectorAll('img');
      images.forEach((img) => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', handleImageClick);
      });

      const contentHeight = contentRef.current.scrollHeight;
      const maxHeight = 500; 
      setNeedsShowMore(contentHeight > maxHeight);

      return () => {
        images.forEach((img) => {
          img.removeEventListener('click', handleImageClick);
        });
      };
    }
  }, [publication.content, showMore]);

  const handleShowMore = () => setShowMore(!showMore);

  const handleHashtagClick = (hashtag) => {
    goToSearch(null, hashtag); 
  };

  const handlePublicationClick = (slug) => {
    goToPublication(slug);
  };

  const handleUserClick = (id) => {
    goToUser(id); 
  };

  const handleCommunityClick = (slug) => {
    goToCommunity(slug); 
  };

  const handleAddToCollection = async () => {
    const token = localStorage.getItem('token');
    try {
      const collections = await fetchMyCollections(token);
      setUserCollections(collections);
      setIsAddingToCollection(true);
    } catch (error) {
      console.error('Error fetching user collections:', error);
    }
  };

  const handleImageClick = (e) => {
    e.stopPropagation(); 
    setSelectedImage(e.target.src); 
    setIsImageModalOpen(true);
  };

  return (
    <li ref={lastPublicationElementRef} key={publication.id} className="publication-container">
      <div className="publication-header">
        <p className="publication-author" onClick={() => handleUserClick(publication.author_id)}>
          {publication.author}
        </p>
        <p className="publication-community" onClick={() => handleCommunityClick(publication.community_slug)}>
          {publication.community_name}
        </p>
        <p className="publication-date">{new Date(publication.date_posted).toLocaleString()}</p>
      </div>

      <h3 className="publication-title" onClick={() => handlePublicationClick(publication.slug)}>
        {publication.title}
      </h3>

      <div className="publication-content-container">
        <div
          className="publication-content"
          style={{ maxHeight: showMore ? 'none' : '500px', overflow: 'hidden' }}
          dangerouslySetInnerHTML={{ __html: publication.content }}
          ref={contentRef}
        />
        {needsShowMore && (
          <button className="show-more-button" onClick={handleShowMore}>
            {showMore ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>

      <div className="publication-footer">
        <div className="like-container">
          <LikeComponent
            contentType={contentTypeId}
            objectId={publication.id}
            initialLikes={likes_count}
            initialDislikes={dislikes_count}
            initialUserLikeStatus={user_like_status}
          />
        </div>
        <button onClick={handleAddToCollection}>Add to Collection</button>
        <div className="publication-hashtags-container" ref={hashtagsContainerRef}>
          <ul className="publication-hashtags">
            {visibleHashtags}
          </ul>
        </div>
      </div>

      {isAddingToCollection && (
        <AddToCollectionModal
          publicationId={publication.id}
          collections={userCollections}
          onClose={() => setIsAddingToCollection(false)}
        />
      )}

      {isImageModalOpen && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setIsImageModalOpen(false)}
        />
      )}
    </li>
  );
};

export default PublicationListItem;