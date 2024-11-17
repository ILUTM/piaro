import { useContext, createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [authUser, setAuthUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('authUser');
        const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
        if (storedUser && storedIsLoggedIn) {
            setAuthUser(JSON.parse(storedUser));
            setIsLoggedIn(JSON.parse(storedIsLoggedIn));
        }
    }, []);

    useEffect(() => {
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
