import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [authUser, setAuthUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [refreshTimeout, setRefreshTimeout] = useState(null);

    const authFetch = async (url, options = {}) => {
        // Add authorization header if token exists
        const token = localStorage.getItem('token');
        const headers = {
            ...options.headers,
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        try {
            const response = await fetch(`http://127.0.0.1:8000/api${url}`, {
                ...options,
                headers,
                credentials: 'include'
            });

            // If unauthorized, try to refresh token
            if (response.status === 401 && !options._retry) {
                const refreshed = await refreshToken();
                if (refreshed) {
                    // Retry original request with new token
                    return authFetch(url, {
                        ...options,
                        _retry: true,
                        headers: {
                            ...headers,
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });
                }
                throw new Error('Authentication failed');
            }

            return response;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    };

    const refreshToken = async () => {
        try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (!refreshToken) throw new Error('No refresh token available');

            const response = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refresh: refreshToken }),
                credentials: 'include'
            });

            if (!response.ok) throw new Error('Token refresh failed');

            const data = await response.json();
            localStorage.setItem('token', data.access);
            return true;
        } catch (error) {
            console.error('Token refresh error:', error);
            logout();
            return false;
        }
    };

    const scheduleTokenRefresh = () => {
        // Clear existing timeout if any
        if (refreshTimeout) clearTimeout(refreshTimeout);

        // Schedule refresh 1 minute before token expiration (assuming 5 min expiry)
        const timeoutId = setTimeout(async () => {
            await refreshToken();
            scheduleTokenRefresh(); // Schedule next refresh
        }, 240000); // 4 minutes

        setRefreshTimeout(timeoutId);
    };

    const checkAuth = async () => {
        try {
            const response = await authFetch('/check_auth/');
            if (response.ok) {
                const userData = await response.json();
                setAuthUser(userData);
                setIsLoggedIn(true);
                scheduleTokenRefresh();
            } else {
                logout();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            logout();
        }
    };

    const login = async (userData) => {
        localStorage.setItem('token', userData.access);
        localStorage.setItem('refresh_token', userData.refresh);
        localStorage.setItem('username', userData.username);
        setAuthUser(userData);
        setIsLoggedIn(true);
        scheduleTokenRefresh();
    };

    const logout = async () => {
        try {
            await authFetch('/logout/', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('username');
            setAuthUser(null);
            setIsLoggedIn(false);
            if (refreshTimeout) clearTimeout(refreshTimeout);
        }
    };

    useEffect(() => {
        checkAuth();
        return () => {
            if (refreshTimeout) clearTimeout(refreshTimeout);
        };
    }, []);

    return (
        <AuthContext.Provider value={{
            authUser,
            isLoggedIn,
            login,
            logout,
            authFetch // Provide the enhanced fetch function
        }}>
            {children}
        </AuthContext.Provider>
    );
}