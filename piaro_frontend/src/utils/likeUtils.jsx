const apiUrl = 'http://127.0.0.1:8000/api/likes';

// Fetch the summary of likes and dislikes
export const fetchLikeSummary = async (contentType, objectId) => {
    try {
        const response = await fetch(`${apiUrl}/summary/?content_type=${contentType}&object_id=${objectId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error('Failed to fetch like summary');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching like summary:', error);
        throw error;
    }
};

// Toggle likes/dislikes
export const toggleLike = async (contentType, objectId, action) => {
    try {
        const requestBody = {
            content_type: contentType,
            object_id: objectId,
            action: action,
        };
        
        // Log the request body
        console.log('Sending request with:', requestBody);

        const response = await fetch(`${apiUrl}/toggle/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(requestBody),
        });

        // Log the response status
        console.log('Response status:', response.status);

        if (!response.ok) {
            throw new Error('Failed to toggle like/dislike');
        }
        const data = await response.json();
        // Log the response data
        console.log('Response data:', data);

        return data;
    } catch (error) {
        console.error('Error toggling like/dislike:', error);
        throw error;
    }
};

