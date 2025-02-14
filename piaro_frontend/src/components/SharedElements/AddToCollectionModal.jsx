import React, { useEffect, useState, useRef } from 'react';
import { addPublicationToCollection } from '../../utils/collectionUtils';
import styles from '../../sharedStyles/AddToCollectionModal.css';

const AddToCollectionModal = ({ publicationId, collections, onClose }) => {
  const modalRef = useRef(null);
  const [error, setError] = useState('');

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCollectionClick = async (collectionId) => {
    try {
      const token = localStorage.getItem('token');
      await addPublicationToCollection(token, collectionId, publicationId);
      onClose();
    } catch (error) {
      console.error('There was an error adding the publication to the collection!', error);
      setError('Failed to add publication to the collection.');
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent} ref={modalRef}>
        <span className={styles.close} onClick={onClose}>×</span>
        <h2>Select a Collection</h2>
        {error && <p className={styles.error}>{error}</p>}
        {collections && collections.length > 0 ? (
          <ul>
            {collections.map((collection) => (
              <li key={collection.id} onClick={() => handleCollectionClick(collection.id)}>
                {collection.name}
              </li>
            ))}
          </ul>
        ) : (
          <p>No collections available.</p>
        )}
      </div>
    </div>
  );
};

export default AddToCollectionModal;
