const API_BASE_URL = 'http://127.0.0.1:8000/api';

/**
 * Fetch the logged-in user's collections.
 */
export const fetchMyCollections = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/collections/my_collections/`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('There was an error fetching the collections!', error);
        throw error;
    }
};

/**
 * Create a new collection.
 */
export const createCollection = async (token, collectionData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/collections/create_collection/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(collectionData),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('There was an error creating the collection!', error);
        throw error;
    }
};

/**
 * Add a publication to a collection.
 */
export const addPublicationToCollection = async (token, collectionId, publicationId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/collections/${collectionId}/add_publication/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ publication_id: publicationId }),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('There was an error adding the publication to the collection!', error);
        throw error;
    }
};


export const removePublicationFromCollection = async (token, collectionId, publicationId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/collections/${collectionId}/remove_publication/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ publication_id: publicationId }),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('There was an error removing the publication from the collection!', error);
        throw error;
    }
};