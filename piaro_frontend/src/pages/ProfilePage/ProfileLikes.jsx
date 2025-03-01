import React, { useState, useEffect } from 'react'; 
import { fetchUserLikes } from '../../components/Like/likeUtils'; 
import PublicationListItem from '../../components/SharedElements/PublicationListItem';
import '../../sharedStyles/ProfilePage.css';

const ProfileLikes = () => {
    const [likes, setLikes] = useState([]);
    const [publications, setPublications] = useState([]);
    const [comments, setComments] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getUserLikes = async () => {
            try {
                const data = await fetchUserLikes();
                console.log(data);
                setLikes(data);
                setPublications(data.filter(like => like.content_type.model === 'publication'));
                setComments(data.filter(like => like.content_type.model === 'comment'));
            } catch (error) {
                setError('Failed to fetch user likes');
            }
        };
        getUserLikes();
    }, []);

    return (
        <div>
            <h3>Your Likes</h3>
            {error && <p>{error}</p>}
            <h4>Publications</h4>
            <ul className='publications-list'>
                {publications.map((like) => (
                    <PublicationListItem
                        key={like.id}
                        publication={like.content_object}
                    />
                ))}
            </ul>
            <h4>Comments</h4>
            <ul className='comments-list'>
                {comments.map((like) => (
                    <li key={like.id}>
                        <p>{like.content_object.author}</p>
                        <p>{like.content_object.text}</p>
                        <p>{new Date(like.content_object.date_posted).toLocaleString()}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProfileLikes;
