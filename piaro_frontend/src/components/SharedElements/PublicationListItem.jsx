import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../sharedStyles/PublicationList.css';
import { fetchLikeSummary, toggleLike } from '../../utils/likeUtils';
import { fetchContentTypeId } from '../../utils/ContentTypes';  // A utility to fetch content type IDs

const PublicationListItem = ({
  publication,
  index,
  lastPublicationElementRef,
}) => {
  const [showMore, setShowMore] = useState(false);
  const [showAllHashtags, setShowAllHashtags] = useState(false);
  const [contentTypeId, setContentTypeId] = useState(null);
  const [likeSummary, setLikeSummary] = useState({ likes: 0, dislikes: 0 });
  const [userLikeStatus, setUserLikeStatus] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContentType = async () => {
      const contentTypeId = await fetchContentTypeId('publication');
      setContentTypeId(contentTypeId);
      fetchSummary(contentTypeId); // Fetch like summary once contentTypeId is set
    };
    fetchContentType();
  }, []);

  const fetchSummary = async (contentTypeId) => {
    try {
      const summary = await fetchLikeSummary(contentTypeId, publication.id);
      setLikeSummary(summary);
    } catch (error) {
      setError('Failed to fetch like summary');
    }
  };

  const handleToggleLike = async (action) => {
    try {
      await toggleLike(contentTypeId, publication.id, action);
      fetchSummary(contentTypeId); // Fetch updated summary
    } catch (error) {
      setError('Failed to toggle like/dislike');
    }
  };

  const handleShowMore = () => setShowMore(!showMore);
  const handleShowAllHashtags = () => setShowAllHashtags(!showAllHashtags);

  const handleHashtagClick = (hashtag) => {
    navigate(`/search?hashtags=${hashtag}`);
  };

  const handlePublicationClick = (id) => {
    navigate(`/Publication/${id}`);
  };

  const handleUserClick = (id) => {
    navigate(`/user/${id}`);
  };

  const handleCommunityClick = (id) => {
    navigate(`/community/${id}`);
  };

  return (
    <li ref={lastPublicationElementRef} key={publication.id} className="publication-container">
      <div className="publication-header">
        <p className="publication-author" onClick={() => handleUserClick(publication.author_id)}>
          {publication.author}
        </p>
        <p className="publication-community" onClick={() => handleCommunityClick(publication.community)}>
          {publication.community_name}
        </p>
        <p className="publication-date">{new Date(publication.date_posted).toLocaleString()}</p>
      </div>

      <h3 className="publication-title" onClick={() => handlePublicationClick(publication.id)}>
        {publication.title}
      </h3>

      <div className="publication-content-container">
        <div
          className="publication-content"
          style={{ maxHeight: showMore ? 'none' : '500px', overflow: 'hidden' }}
          dangerouslySetInnerHTML={{ __html: publication.content }}
        />
        {publication.content.length > 500 && (
          <button onClick={handleShowMore}>
            {showMore ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>

      <div className="publication-footer">
        <div className="like-dislike-buttons">
          <button onClick={() => handleToggleLike('like')} className={`like-button ${userLikeStatus === true ? 'liked' : ''}`}>
            Like
          </button>
          <span>Likes: {likeSummary.likes}</span> | <span>Dislikes: {likeSummary.dislikes}</span>
          <button onClick={() => handleToggleLike('dislike')} className={`dislike-button ${userLikeStatus === false ? 'disliked' : ''}`}>
            Dislike
          </button>
          <button onClick={() => handleToggleLike('remove')}>Remove</button>
        </div>
        <ul className="publication-hashtags">
          {publication.hashtags.slice(0, showAllHashtags ? publication.hashtags.length : 2).map((hashtag, index) => (
            <li key={index} className="hashtag" onClick={() => handleHashtagClick(hashtag.name)}>
              {hashtag.name}
            </li>
          ))}
          {publication.hashtags.length > 2 && (
            <button onClick={handleShowAllHashtags}>
              {showAllHashtags ? 'Show Less Hashtags' : 'See All Hashtags'}
            </button>
          )}
        </ul>
      </div>
    </li>
  );
};

export default PublicationListItem;


