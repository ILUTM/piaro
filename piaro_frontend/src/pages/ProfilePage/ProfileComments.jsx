import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../utils/navigation'; 
import '../../sharedStyles/ProfilePage.css';

const ProfileComments = () => {
  const [comments, setComments] = useState([]);
  const [error, setError] = useState('');
  const { goToPublication } = useNavigation(); 

  const fetchComments = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/comments/my_comments/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setComments(data || []); 
    } catch (error) {
      console.error('There was an error fetching the comments!', error);
      setError('Failed to fetch comments. Please try again.');
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const handlePublicationClick = (slug) => {
    goToPublication(slug); 
  };

  return (
    <div>
      <h2>My Comments</h2>
      {error && <p className="error">{error}</p>}
      <ul>
        {comments.map(comment => (
          <li key={comment.id}>
             <p>{comment.text}</p>
            <p><strong>Date:</strong> {new Date(comment.date_posted).toLocaleString()}</p>
            <button onClick={() => handlePublicationClick(comment.publication_slug)}>Navigate to the comment</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfileComments;
