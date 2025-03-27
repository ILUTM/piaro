const apiUrl = 'http://127.0.0.1:8000/api/likes';

export const fetchLikeSummary = async (contentType, objectId) => {
    try {
        const response = await fetch(
            `${apiUrl}/summary/?content_type=${contentType}&object_id=${objectId}`, 
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            }
        );
        if (!response.ok) throw new Error('Failed to fetch like summary');
        return await response.json();
    } catch (error) {
        console.error('Error fetching like summary:', error);
        throw error;
    }
};

export const toggleLike = async (contentType, objectId, action) => {
    try {
        const response = await fetch(`${apiUrl}/toggle/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                content_type: contentType,
                object_id: objectId,
                action: action,
            }),
        });

        if (!response.ok) throw new Error('Failed to toggle like/dislike');
        return await response.json();
    } catch (error) {
        console.error('Error toggling like/dislike:', error);
        throw error;
    }
};

// Add cache with 5-second expiry
const summaryCache = {};
const CACHE_DURATION = 5000; // 5 seconds

export const getCachedLikeSummary = async (contentType, objectId) => {
    const cacheKey = `${contentType}-${objectId}`;
    const now = Date.now();
    
    if (summaryCache[cacheKey] && (now - summaryCache[cacheKey].timestamp < CACHE_DURATION)) {
        return summaryCache[cacheKey].data;
    }
    
    const data = await fetchLikeSummary(contentType, objectId);
    summaryCache[cacheKey] = { data, timestamp: now };
    return data;
};

export const fetchUserLikes = async () => {
  try {
    const response = await fetch(`${apiUrl}/my_likes/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user likes');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user likes:', error);
    throw error;
  }
};
