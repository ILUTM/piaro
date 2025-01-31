import React, { useState, useEffect } from 'react';
import { fetchLikeSummary, toggleLike } from './likeUtils';
import '../../sharedStyles/LikeComponent.css';

const LikeComponent = ({ contentType, objectId }) => {
    const [likeSummary, setLikeSummary] = useState({ likes: 0, dislikes: 0 });
    const [likeStatus, setLikeStatus] = useState(null); // 'liked' or 'disliked'
    const [error, setError] = useState(null);

    useEffect(() => {
        const getLikeSummary = async () => {
            try {
                const summary = await fetchLikeSummary(contentType, objectId);
                setLikeSummary(summary);
            } catch (error) {
                setError('Failed to fetch like summary');
            }
        };

        getLikeSummary();
    }, [contentType, objectId]);

    const handleToggleLike = async (action) => {
        try {
            await toggleLike(contentType, objectId, action);
            const summary = await fetchLikeSummary(contentType, objectId);
            setLikeSummary(summary);
            setLikeStatus(action); // Update the status based on the action
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
