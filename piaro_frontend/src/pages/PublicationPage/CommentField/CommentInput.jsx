import React from 'react';

const CommentInput = ({handleAddComment, newComment, setNewComment, isAddingComment}) => {

    return (
        <div className="comment-input">
        <form onSubmit={handleAddComment} className="add-comment-form">
            <input 
            value={newComment}
            onChange={event => setNewComment(event.target.value)}
            placeholder='...' 
            className='input-field'
            />
            <button className="add-comment-button" >
            {isAddingComment ? 'Adding...' : 'Comment'}
            </button>
        </form>
        </div>
    )
};

export default CommentInput;