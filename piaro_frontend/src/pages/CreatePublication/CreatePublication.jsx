import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import RichTextEditor from '../../components/RichTextEditor/RichTextEditor';
import '../../sharedStyles/CreatePublication.css';

const CreatePublication = () => {
  const location = useLocation();
  const community = location.state?.community;

  const [newPublication, setNewPublication] = useState({
    title: '',
    content: '',
    hashtags: [],
    community: community?.id || ''
  });
  const [newHashtag, setNewHashtag] = useState('');
  const [error, setError] = useState('');

  const handleCreatePublication = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    console.log('New Publication Data:', newPublication);

    if (!newPublication.title || !newPublication.content) {
      alert('Title and content are required.');
      return;
    }

    fetch('http://127.0.0.1:8000/api/publications/post_publication/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...newPublication,
        content: JSON.stringify(newPublication.content),
        community: community?.id 
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      setNewPublication({ title: '', content: null, hashtags: [], community: '' });
      console.log(newPublication.content);
    })
    .catch(error => {
      console.error('There was an error posting the publication!', error);
      setError('Posting publication failed. It will be repaired soon.');
    });
  };

  const handleContentChange = (content) => {
    setNewPublication({ ...newPublication, content });
  };

  const handleAddHashtag = () => {
    if (newHashtag.trim() && !newPublication.hashtags.includes(newHashtag.trim())) {
      setNewPublication({
        ...newPublication,
        hashtags: [...newPublication.hashtags, newHashtag.trim()]
      });
      setNewHashtag(''); 
    } else {
      alert('Hashtag is empty or already exists.');
    }
  };

  const handleRemoveHashtag = (hashtag) => {
    setNewPublication({
      ...newPublication,
      hashtags: newPublication.hashtags.filter(h => h !== hashtag)
    });
  };

  return (
    <div className="create-publication-container">
      <h2>Create a New Publication</h2>
      {error && <p className="error">{error}</p>}
      {community?.name && <p>New publication for community: {community.name}</p>}
      <form onSubmit={handleCreatePublication} className="create-publication-form">
        <input
          type="text"
          placeholder="Title"
          value={newPublication.title}
          onChange={(e) => setNewPublication({ ...newPublication, title: e.target.value })}
          className="form-input"
        />
        <RichTextEditor value={newPublication.content} onChange={handleContentChange} />
        <div className="hashtag-input-container">
          <input
            type="text"
            placeholder="Add a hashtag"
            value={newHashtag}
            onChange={(e) => setNewHashtag(e.target.value)}
            className="form-input"
          />
          <button
            type="button"
            onClick={handleAddHashtag}
            className="add-hashtag-button"
          >
            Add Hashtag
          </button>
        </div>
        <div className="hashtags-container">
          {newPublication.hashtags.map((hashtag, index) => (
            <span key={index} className="hashtag">
              #{hashtag}
              <button
                type="button"
                onClick={() => handleRemoveHashtag(hashtag)}
                className="remove-hashtag-button"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <button type="submit" className="form-button">Create Publication</button>
      </form>
    </div>
  );
};

export default CreatePublication;