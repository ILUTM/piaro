import React from 'react';
import ReactDOM from 'react-dom';
import styles from '../../sharedStyles/CollectionViewModal.module.css';
import { useNavigate } from 'react-router-dom';

const CollectionViewModal = ({ collection, onClose }) => {
  const navigate = useNavigate();

  const handlePublicationClick = (id) => {
    navigate(`/publication/${id}`);
  };

  return ReactDOM.createPortal(
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <span className={styles.close} onClick={onClose}>&times;</span>
        <h2>{collection.name}</h2>
        {collection.publications && collection.publications.length > 0 ? (
          <ul>
            {collection.publications.map((publication) => (
              <li
                key={publication.id}
                className={styles.publicationItem}
                onClick={() => handlePublicationClick(publication.id)} // Fixed onClick
              >
                <h3>{publication.title}</h3>
                <p className={styles.meta}>
                  Posted by <strong>{publication.author}</strong> in{' '}
                  <strong>{publication.community_name}</strong> on{' '}
                  {new Date(publication.date_posted).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No publications in this collection.</p>
        )}
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default CollectionViewModal;