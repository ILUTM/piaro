const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const fetchMyCollections = async (token) => {
    try {
        const response = await fetch(`${API_BASE_URL}/collections/my_collections/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
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

export const toggleCollectionVisibility = async (token, collectionId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/collections/${collectionId}/toggle_visibility/`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('There was an error toggling the collection visibility!', error);
        throw error;
    }
};

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

export const viewPublicCollection = async (collectionId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/collections/${collectionId}/view_public/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('There was an error viewing the public collection!', error);
        throw error;
    }
};

export const copyCollection = async (token, collectionId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/collections/${collectionId}/copy_collection/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('There was an error copying the collection!', error);
        throw error;
    }
};
