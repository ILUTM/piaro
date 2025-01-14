const apiUrl = 'http://127.0.0.1:8000/api/subscriptions';

export const fetchContentType = async (type) => {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/utils/content_types/');
        if (!response.ok) {
            throw new Error('Failed to fetch content types');
        }
        const data = await response.json();
        return data[type];
    } catch (error) {
        console.error('Error fetching content types:', error);
        throw error;
    }
};

export const subscribe = async (contentType, objectId) => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${apiUrl}/subscribe/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content_type: contentType,
                object_id: objectId,
                send_notifications: false,
            }),
        });
        if (response.status === 401) {
            alert('Login to subscribe');
            return;
        }
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('There was an error subscribing:', error);
        throw error;
    }
};


export const unsubscribe = async (contentType, objectId) => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${apiUrl}/unsubscribe/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content_type: contentType,
                object_id: objectId,
            }),
        });
        if (response.status === 204) {
            return { status: 'unsubscribed' }; // Handle 204 response without parsing JSON
        }
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('There was an error unsubscribing:', error);
        throw error;
    }
};

export const checkSubscription = async (contentType, objectId) => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${apiUrl}/check_subscription/?content_type=${contentType}&object_id=${objectId}`, {
            method: 'GET',
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
        console.error('There was an error checking subscription status:', error);
        throw error;
    }
};

export const toggleNotifications = async (contentType, objectId) => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${apiUrl}/toggle_notifications/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content_type: contentType,
                object_id: objectId,
            }),
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('There was an error toggling notifications:', error);
        throw error;
    }
};
