import { useContext, createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [authUser, setAuthUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        checkAuthentication();
    }, []);

    const checkAuthentication = async() => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/check_auth/', {
              method: 'GET',
              credentials: 'include'  
            });

            if (response.ok) {
                const data = await response.json();
                setAuthUser(data);
                setIsLoggedIn(true);
                localStorage.setItem('token', data.access);
            } else {
                logout(); 
            }
        } catch (error) {
            console.error('Authentication check error:', error);
            setAuthUser(null);
            setIsLoggedIn(false);
        }
    };

    const login = (userData) => {
        setAuthUser(userData);
        setIsLoggedIn(true);
        localStorage.setItem('token', userData.access); 
        localStorage.setItem('username', userData.username);
    };

    const logout = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/logout/', {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                setAuthUser(null);
                setIsLoggedIn(false);
            } else {
                console.error('Logout failed');
            } 
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const value = {
        authUser,
        setAuthUser,
        isLoggedIn,
        setIsLoggedIn,
        login,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
