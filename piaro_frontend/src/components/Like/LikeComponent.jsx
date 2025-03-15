import React, { useState, useEffect } from 'react';
import { toggleLike, fetchLikeSummary } from './likeUtils';
import '../../sharedStyles/LikeComponent.css';

const LikeComponent = ({ contentType, objectId, initialLikes, initialDislikes, initialUserLikeStatus }) => {
  const [likeSummary, setLikeSummary] = useState({ likes: initialLikes, dislikes: initialDislikes });
  const [likeStatus, setLikeStatus] = useState(initialUserLikeStatus); 
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await fetchLikeSummary(contentType, objectId);
        setLikeSummary({ likes: data.likes, dislikes: data.dislikes });
        setLikeStatus(data.user_like_status);
      } catch (error) {
        console.error('Error fetching like summary:', error);
        setError('Failed to fetch like summary');
      }
    };

    fetchSummary();
  }, [contentType, objectId]);

  const handleToggleLike = async (action) => {
    if (loading) return; 
    setLoading(true);
    setError(null); 

    try {
      await toggleLike(contentType, objectId, action);

      const data = await fetchLikeSummary(contentType, objectId);
      setLikeSummary({ likes: data.likes, dislikes: data.dislikes });
      setLikeStatus(data.user_like_status);
    } catch (error) {
      setError('Failed to toggle like/dislike');
      console.error('Error toggling like/dislike:', error);
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="like-component">
      <div
        className={`like-item ${likeStatus === 'liked' ? 'liked' : ''}`}
        onClick={() => handleToggleLike('like')}
        style={{ pointerEvents: loading ? 'none' : 'auto' }}
      >
        <div className="heart-icon"></div>
        <span>{likeSummary.likes}</span>
      </div>
      <div
        className={`like-item ${likeStatus === 'disliked' ? 'disliked' : ''}`}
        onClick={() => handleToggleLike('dislike')}
        style={{ pointerEvents: loading ? 'none' : 'auto' }} 
      >
        <div className="broken-heart-icon"></div>
        <span>{likeSummary.dislikes}</span>
      </div>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default LikeComponent;