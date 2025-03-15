import React, { useState } from 'react';
import CommentInput from './CommentInput';
import LikeComponent from '../../../components/Like/LikeComponent';
import '../../../sharedStyles/CommentField.css';

const CommentItem = ({ 
  comment, 
  handleReply, 
  replyTo, 
  contentTypeId, 
  handleDeleteComment, 
  currentUser, 
  communityOwnerId 
}) => {
  const [replyComment, setReplyComment] = useState('');

  const handleAddReply = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!replyComment) {
      alert('Reply text is required.');
      return;
    }

    const url = `http://127.0.0.1:8000/api/comments/${comment.id}/add_reply/`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: replyComment }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      setReplyComment('');
      handleReply(null); 
    } catch (error) {
      console.error('There was an error adding the reply', error);
    }
  };

  // Check if the current user is the comment creator or community owner
  const isCommentCreator = comment.author === currentUser;
  const isCommunityOwner = communityOwnerId === currentUser;

  return (
    <div key={comment.id} className="comment-content">
      <p className="comment-author">{comment.author}</p>
      <p className="comment-text">{comment.text}</p>
      <p className="comment-date">{new Date(comment.date_posted).toLocaleString()}</p>
      {contentTypeId && <LikeComponent contentType={contentTypeId} objectId={comment.id} />}
      <button className="reply-button" onClick={() => handleReply(comment.id)}>Reply</button>
      <button className="cancel-reply-button" onClick={() => handleReply(null)}>Cancel</button>
      
      {/* Delete button for comment creator or community owner */}
      {(isCommentCreator || isCommunityOwner) && (
        <button 
          className="delete-button" 
          onClick={() => handleDeleteComment(comment.id)}
        >
          Delete
        </button>
      )}

      {replyTo === comment.id && (
        <CommentInput 
          handleAddComment={handleAddReply}
          newComment={replyComment}
          setNewComment={setReplyComment}
          isAddingComment={false} 
        />
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="replies">
          {comment.replies.map(reply => (
            <CommentItem 
              key={reply.id}
              comment={reply}
              handleReply={handleReply}
              replyTo={replyTo}
              contentTypeId={contentTypeId}
              handleDeleteComment={handleDeleteComment}
              currentUser={currentUser}
              communityOwnerId={communityOwnerId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;