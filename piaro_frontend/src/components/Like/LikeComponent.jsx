import React, { useState, useEffect } from 'react';
import { fetchLikeSummary, toggleLike } from './likeUtils';

const LikeComponent = ({ contentType, objectId }) => {
    const [likeSummary, setLikeSummary] = useState({ likes: 0, dislikes: 0 });
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
        } catch (error) {
            setError('Failed to toggle like/dislike');
        }
    };

    return (
        <div>
            <h3>Likes: {likeSummary.likes}</h3>
            <h3>Dislikes: {likeSummary.dislikes}</h3>
            {error && <p>{error}</p>}
            <button onClick={() => handleToggleLike('like')}>Like</button>
            <button onClick={() => handleToggleLike('dislike')}>Dislike</button>
        </div>
    );
};

export default LikeComponent;

