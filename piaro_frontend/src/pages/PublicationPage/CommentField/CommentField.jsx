import React, { useEffect, useState, useCallback } from 'react';
import '../../../sharedStyles/CommentField.css';
import CommentInput from './CommentInput';
import CommentItem from './CommentItem';

const CommentField = ({ publicationId }) => {
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [error, setError] = useState('');
  const [comments, setComments] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      setIsFetching(true);
      const response = await fetch(`http://127.0.0.1:8000/api/comments/${publicationId}/get_comments_by_publication/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('There was an error fetching comments', error);
      setError('Fetching comments failed');
    } finally {
      setIsFetching(false);
    }
  }, [publicationId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments, publicationId]);

  const handleAddComment = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!newComment) {
      alert('Comment text is required.');
      return;
    }

    const url = replyTo
      ? `http://127.0.0.1:8000/api/comments/${replyTo}/add_reply/`
      : `http://127.0.0.1:8000/api/comments/${publicationId}/add_comment/`;

    try {
      setIsAddingComment(true);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newComment }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
      fetchComments();
      setNewComment('');
    } catch (error) {
      console.error('There was an error adding the comment', error);
      setError('Adding comment failed');
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleReply = (commentId) => {
    setReplyTo(commentId);
  };

  return (
    <div className="comment-field">
      <span className="text-3xl">nested component</span>
      <CommentInput
        newComment={newComment}
        setNewComment={setNewComment}
        handleAddComment={handleAddComment}
        isAddingComment={isAddingComment}
      />
      <div className="comments-container">
        {comments.map((comment) => (
          <CommentItem 
            key={comment.id}
            comment={comment}
            handleReply={handleReply}
            replyTo={replyTo}
          />
        ))}
      </div>
    </div>
  );
};

export default CommentField;
