import React, { useState } from 'react';
import CommentInput from './CommentInput';

const CommentItem = ({ comment, handleReply, replyTo }) => {
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
      handleReply(null); // Close the reply input after adding the reply
    } catch (error) {
      console.error('There was an error adding the reply', error);
    }
  };

  return (
    <div key={comment.id} className="comment-content">
      <p className="comment-author">{comment.author}</p>
      <p className="comment-text">{comment.text}</p>
      <p className="comment-date">{new Date(comment.date_posted).toLocaleString()}</p>
      <button className="reply-button" onClick={() => handleReply(comment.id)}>Reply</button>
      <button className="cancel-reply-button" onClick={() => handleReply(null)}>Cancel</button>
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;

