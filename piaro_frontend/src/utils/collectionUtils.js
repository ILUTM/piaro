const apiUrl = 'http://127.0.0.1:8000/api/collections';

export const fetchCollections = async (endpoint, token) => {
  try {
    const response = await fetch(`${apiUrl}/${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`There was an error fetching collections:`, error);
    throw error;
  }
};

export const createCollection = async (name, isPublic, token) => {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name, is_public: isPublic }),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('There was an error creating the collection:', error);
    throw error;
  }
};

export const toggleVisibility = async (collectionId, token) => {
  try {
    const response = await fetch(`${apiUrl}/${collectionId}/toggle_visibility/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('There was an error toggling visibility:', error);
    throw error;
  }
};

export const addPublicationToCollection = async (collectionId, publicationId, token) => {
  try {
    const response = await fetch(`${apiUrl}/${collectionId}/add_publication/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ publication_id: publicationId }),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('There was an error adding publication to the collection:', error);
    throw error;
  }
};

export const viewPublicCollection = async (collectionId, token = null) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${apiUrl}/${collectionId}/view_public/`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('There was an error viewing the collection:', error);
    throw error;
  }
};

export const copyCollection = async (collectionId, token) => {
  try {
    const response = await fetch(`${apiUrl}/${collectionId}/copy_collection/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('There was an error copying the collection:', error);
    throw error;
  }
};
