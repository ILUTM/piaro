import { useState, useEffect } from 'react';
import { fetchContentTypeId } from './ContentTypes';

export const usePublicationLike = (initialPublications = []) => {
  const [publications, setPublications] = useState(initialPublications);
  const [contentTypeId, setContentTypeId] = useState(null);
  const [contentTypeError, setContentTypeError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchId = async () => {
      try {
        // Try to get publication content type (ID 9 from your response)
        const id = await fetchContentTypeId('publication');
        if (isMounted) {
          setContentTypeId(id);
        }
      } catch (error) {
        if (isMounted) {
          setContentTypeError(error.message);
          console.error('Failed to fetch content type:', error);
          // Fallback to known publication ID if API fails
          setContentTypeId(9); 
        }
      }
    };

    fetchId();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLikeToggle = (publicationId, likes, dislikes, userLikeStatus) => {
    setPublications(prev => 
      prev.map(pub => 
        pub.id === publicationId 
          ? { 
              ...pub, 
              likes_count: likes, 
              dislikes_count: dislikes, 
              user_like_status: userLikeStatus 
            }
          : pub
      )
    );
  };

  return {
    publications,
    setPublications,
    contentTypeId,
    contentTypeError,
    handleLikeToggle
  };
};