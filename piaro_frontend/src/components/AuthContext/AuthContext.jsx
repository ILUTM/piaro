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
            } else {
                setAuthUser(null);
                setIsLoggedIn(false);
            }
        } catch (error) {
            console.error('Authentication check error:', error);
            setAuthUser(null);
            setIsLoggedIn(false);
        }
    };
     
    useEffect(() => {
        // Optional: You might want to remove this if you don't need Local Storage persistence
        localStorage.setItem('authUser', JSON.stringify(authUser));
        localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
    }, [authUser, isLoggedIn]);

    const value = {
        authUser,
        setAuthUser,
        isLoggedIn,
        setIsLoggedIn
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
