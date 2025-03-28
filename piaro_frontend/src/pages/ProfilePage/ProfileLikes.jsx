import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicationListItem from '../../components/SharedElements/PublicationListItem';
import '../../sharedStyles/PageCommonStyle.css';

const ProfileLikes = () => {
    const [publications, setPublications] = useState([]);
    const [comments, setComments] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLikedContent = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                
                // Fetch liked publications
                const pubsResponse = await fetch('http://127.0.0.1:8000/api/publications/liked_publications/', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!pubsResponse.ok) throw new Error('Failed to fetch liked publications');
                
                const publicationsData = await pubsResponse.json();
                setPublications(publicationsData.results || publicationsData);

                // Fetch liked comments
                const commentsResponse = await fetch('http://127.0.0.1:8000/api/likes/my_likes/', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!commentsResponse.ok) throw new Error('Failed to fetch liked comments');
                
                const allLikes = await commentsResponse.json();
                const commentLikes = allLikes.filter(like => 
                    like.content_type.model === 'comment' && like.content_object
                );
                setComments(commentLikes);

            } catch (error) {
                console.error('Error fetching liked content:', error);
                setError('Failed to load your liked content. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchLikedContent();
    }, []);

    const handlePublicationClick = (slug) => {
        navigate(`/publication/${slug}`);
    };

    const handleCommentClick = (publicationSlug) => {
        navigate(`/publication/${publicationSlug}`);
    };

    if (loading) {
        return <div className="page-wrapper">Loading your liked content...</div>;
    }

    if (error) {
        return <div className="page-wrapper error-message">{error}</div>;
    }

    return (
        <div className="page-wrapper">
            <h2>Your Liked Content</h2>
            
            <div className="likes-section">
                <h3>Publications ({publications.length})</h3>
                {publications.length > 0 ? (
                    <div className="publication-list-wrapper">
                        <ul className="publications-list">
                            {publications.map((publication) => (
                                <PublicationListItem
                                    key={publication.id}
                                    publication={publication}
                                    onPublicationClick={() => 
                                        handlePublicationClick(publication.slug)
                                    }
                                    showLikeButton={false}
                                />
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p>No liked publications yet</p>
                )}
            </div>
        </div>
    );
};

export default ProfileLikes;