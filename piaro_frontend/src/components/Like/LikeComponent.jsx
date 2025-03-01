import React, { useState } from 'react';
import { toggleLike } from './likeUtils';
import '../../sharedStyles/LikeComponent.css';

const LikeComponent = ({ contentType, objectId, initialLikes, initialDislikes, initialUserLikeStatus }) => {
  const [likeSummary, setLikeSummary] = useState({ likes: initialLikes, dislikes: initialDislikes });
  const [likeStatus, setLikeStatus] = useState(initialUserLikeStatus); 
  const [error, setError] = useState(null);

  const handleToggleLike = async (action) => {
    try {
      await toggleLike(contentType, objectId, action);
      setLikeSummary(prev => ({
        likes: action === 'like' ? prev.likes + 1 : prev.likes - (likeStatus === 'liked' ? 1 : 0),
        dislikes: action === 'dislike' ? prev.dislikes + 1 : prev.dislikes - (likeStatus === 'disliked' ? 1 : 0),
      }));
      setLikeStatus(action === likeStatus ? null : action); 
    } catch (error) {
      setError('Failed to toggle like/dislike');
    }
  };

  return (
    <div className="like-component">
      <div
        className={`like-item ${likeStatus === 'liked' ? 'liked' : ''}`}
        onClick={() => handleToggleLike('like')}
      >
        <div className="heart-icon"></div>
        <span>{likeSummary.likes}</span>
      </div>
      <div
        className={`like-item ${likeStatus === 'disliked' ? 'disliked' : ''}`}
        onClick={() => handleToggleLike('dislike')}
      >
        <div className="broken-heart-icon"></div>
        <span>{likeSummary.dislikes}</span>
      </div>
      {error && <p>{error}</p>}
    </div>
  );
};

export default LikeComponent;