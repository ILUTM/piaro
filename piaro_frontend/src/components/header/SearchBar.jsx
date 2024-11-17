import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../sharedStyles/SearchBar.css';

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [hashtags, setHashtags] = useState([]);
    const [showHashtagModal, setShowHashtagModal] = useState(false);
    const [newHashtag, setNewHashtag] = useState('');
    const navigate = useNavigate();
    const modalRef = useRef(null);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/search?query=${query}&hashtags=${hashtags.join(',')}`);
    };

    const handleAddHashtag = () => {
        if (newHashtag && !hashtags.includes(newHashtag)) {
            setHashtags([...hashtags, newHashtag]);
            setNewHashtag('');
        }
    };

    const handleRemoveHashtag = (hashtag) => {
        setHashtags(hashtags.filter(h => h !== hashtag));
    };

    const handleCloseModal = () => {
        setShowHashtagModal(false);
    };

    const handleClickOutside = useCallback((e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            handleCloseModal();
        }
    }, [modalRef]);

    useEffect(() => {
        if (showHashtagModal) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showHashtagModal, handleClickOutside]);

    return (
        <div className="search-bar-wrapper">
            <form onSubmit={handleSearch} className="search-form">
                <div className="search-bar-container">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by hashtag, user, or community"
                        className="search-input"
                    />
                    <div className="search-buttons">
                        <button type="button" onClick={() => setShowHashtagModal(true)} className="add-hashtag-button">#</button>
                        <button type="submit" className="search-button">🔍</button>
                    </div>
                </div>
            </form>
            <div className="hashtags-container">
                {hashtags.map((hashtag, index) => (
                    <span key={index} className="hashtag">
                        {hashtag}
                        <button type="button" onClick={() => handleRemoveHashtag(hashtag)} className="remove-hashtag-button">x</button>
                    </span>
                ))}
            </div>
            {showHashtagModal && (
                <div className="modal">
                    <div className="modal-content" ref={modalRef}>
                        <span className="close" onClick={handleCloseModal}>×</span>
                        <h2>Add Hashtag</h2>
                        <input
                            type="text"
                            value={newHashtag}
                            onChange={(e) => setNewHashtag(e.target.value)}
                            placeholder="Enter hashtag"
                            className="new-hashtag-input"
                        />
                        <button type="button" onClick={handleAddHashtag} className="add-hashtag-button">Add Hashtag</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
