import React from 'react';
import ReactDOM from 'react-dom';
import '../../sharedStyles/ImageModal.css';

const ImageModal = ({ imageUrl, onClose }) => {
  return ReactDOM.createPortal(
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close-button" onClick={onClose}>&times;</span>
        <img src={imageUrl} alt="Full size" className="full-size-image" />
      </div>
    </div>,
    document.getElementById('modal-root')
  );
};

export default ImageModal;