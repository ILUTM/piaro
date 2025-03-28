import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicationListItem from '../../components/SharedElements/PublicationListItem';
import { fetchUserLikes } from '../../components/Like/likeUtils';
import '../../sharedStyles/ProfilePage.css';

const ProfileLikes = () => {
    const [publicationLikes, setPublicationLikes] = useState([]);
    const [commentLikes, setCommentLikes] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLikes = async () => {
            try {
                setLoading(true);
                const data = await fetchUserLikes();
                
                // Separate publication and comment likes
                const pubs = data.filter(like => 
                    like.content_type.model === 'publication' && like.content_object
                );
                const comments = data.filter(like => 
                    like.content_type.model === 'comment' && like.content_object
                );
                
                setPublicationLikes(pubs);
                setCommentLikes(comments);
            } catch (error) {
                console.error('Error fetching likes:', error);
                setError('Failed to load your likes. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchLikes();
    }, []);

    const handlePublicationClick = (slug) => {
        navigate(`/publication/${slug}`);
    };

    const handleCommentClick = (publicationSlug) => {
        navigate(`/publication/${publicationSlug}`);
    };

    if (loading) {
        return <div>Loading your likes...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="profile-likes-container">
            <h2>Your Liked Content</h2>
            
            <div className="likes-section">
                <h3>Publications ({publicationLikes.length})</h3>
                {publicationLikes.length > 0 ? (
                    <ul className="publications-list">
                        {publicationLikes.map((like) => (
                            <PublicationListItem
                                key={like.id}
                                publication={like.content_object}
                                onPublicationClick={() => 
                                    handlePublicationClick(like.content_object.slug)
                                }
                                showLikeButton={false}
                            />
                        ))}
                    </ul>
                ) : (
                    <p>No liked publications yet</p>
                )}
            </div>

            <div className="likes-section">
                <h3>Comments ({commentLikes.length})</h3>
                {commentLikes.length > 0 ? (
                    <ul className="comments-list">
                        {commentLikes.map((like) => (
                            <li 
                                key={like.id} 
                                className="comment-item"
                                onClick={() => 
                                    handleCommentClick(like.content_object.publication.slug)
                                }
                            >
                                <div className="comment-header">
                                    <span className="comment-author">
                                        {like.content_object.author || 'Deleted User'}
                                    </span>
                                    <span className="comment-date">
                                        {new Date(like.content_object.date_posted).toLocaleString()}
                                    </span>
                                </div>
                                <p className="comment-text">
                                    {like.content_object.is_deleted ? 
                                        'This comment was deleted' : 
                                        like.content_object.text
                                    }
                                </p>
                                <div className="comment-context">
                                    On publication: {like.content_object.publication.title}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No liked comments yet</p>
                )}
            </div>
        </div>
    );
};

export default ProfileLikes;