import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { createCollection } from '../../utils/collectionUtils';
import styles from '../../sharedStyles/CreateCollectionForm.module.css'; 

const CreateCollectionForm = ({ onClose, onCollectionCreated }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!name) {
      setError('Name is required.');
      return;
    }

    try {
      const newCollection = await createCollection(token, { name });
      onCollectionCreated(newCollection); 
      onClose();
    } catch (error) {
      setError('Error creating collection. Please try again.');
      console.error('Error creating collection:', error);
    }
  };

  return ReactDOM.createPortal(
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <span className={styles.close} onClick={onClose}>&times;</span>
        <h2>Create Collection</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleCreate} className={styles.createCollectionForm}>
          <input
            type="text"
            placeholder="Collection Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.formInput}
          />
          <button type="submit" className={styles.formButton}>
            Create
          </button>
        </form>
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default CreateCollectionForm;