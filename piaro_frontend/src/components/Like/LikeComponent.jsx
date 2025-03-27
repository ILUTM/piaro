import React, { useState, useEffect } from "react";
import { toggleLike, fetchLikeSummary } from './likeUtils';
import '../../sharedStyles/LikeComponent.css';

const LikeComponent = ({ 
  contentType, 
  objectId, 
  initialLikes, 
  initialDislikes, 
  initialUserLikeStatus,
  onLikeChange 
}) => {
  const [likeSummary, setLikeSummary] = useState({ 
    likes: initialLikes, 
    dislikes: initialDislikes 
  });
  const [likeStatus, setLikeStatus] = useState(initialUserLikeStatus);
  const [loading, setLoading] = useState(false);

  // Refresh like status when props change
  useEffect(() => {
    setLikeSummary({
      likes: initialLikes,
      dislikes: initialDislikes
    });
    setLikeStatus(initialUserLikeStatus);
  }, [initialLikes, initialDislikes, initialUserLikeStatus]);

  const handleToggleLike = async (action) => {
    if (loading || !contentType) return;
    setLoading(true);

    try {
      // Optimistic update
      const newStatus = action === 'like' ? 'liked' : 'disliked';
      const wasLiked = likeStatus === 'liked';
      const wasDisliked = likeStatus === 'disliked';
      
      let newLikes = likeSummary.likes;
      let newDislikes = likeSummary.dislikes;
      
      if (action === 'like') {
        newLikes = wasLiked ? newLikes - 1 : newLikes + 1;
        newDislikes = wasDisliked ? newDislikes - 1 : newDislikes;
      } else {
        newDislikes = wasDisliked ? newDislikes - 1 : newDislikes + 1;
        newLikes = wasLiked ? newLikes - 1 : newLikes;
      }
      
      setLikeSummary({ likes: newLikes, dislikes: newDislikes });
      const finalStatus = newStatus === likeStatus ? null : newStatus;
      setLikeStatus(finalStatus);
      
      // Notify parent immediately
      if (onLikeChange) {
        onLikeChange(objectId, newLikes, newDislikes, finalStatus);
      }

      // Then make the API call
      await toggleLike(contentType, objectId, action);
      
      // Verify with server after update
      const updatedSummary = await fetchLikeSummary(contentType, objectId);
      setLikeSummary(updatedSummary);
      if (onLikeChange) {
        onLikeChange(objectId, updatedSummary.likes, updatedSummary.dislikes, finalStatus);
      }
    } catch (error) {
      // Revert on error
      setLikeSummary({ likes: initialLikes, dislikes: initialDislikes });
      setLikeStatus(initialUserLikeStatus);
      if (onLikeChange) {
        onLikeChange(objectId, initialLikes, initialDislikes, initialUserLikeStatus);
      }
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
    </div>
  );
};

export default LikeComponent;