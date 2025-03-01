import React, { useRef, useEffect } from 'react';
import styles from '../../sharedStyles/HashtagModal.module.css';

const HashtagModal = ({ newHashtag, setNewHashtag, handleAddHashtag, handleCloseModal }) => {
    const modalRef = useRef(null);

    const handleClickOutside = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            handleCloseModal();
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent} ref={modalRef}>
                <span className={styles.close} onClick={handleCloseModal} aria-label="Close modal">×</span>
                <h2>Add Hashtag</h2>
                <input
                    type="text"
                    value={newHashtag}
                    onChange={(e) => setNewHashtag(e.target.value)}
                    placeholder="Enter hashtag"
                    className={styles.newHashtagInput}
                />
                <button type="button" onClick={handleAddHashtag} className={styles.addHashtagButton}>
                    Add Hashtag
                </button>
            </div>
        </div>
    );
};

export default HashtagModal;