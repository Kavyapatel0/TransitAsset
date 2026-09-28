import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (stored && token) {
            setUser(JSON.parse(stored));
            // Verify token is still valid
            authService.getMe().then(res => {
                setUser(res.data.data.user);
                localStorage.setItem('user', JSON.stringify(res.data.data.user));
            }).catch(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
            }).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (credentials) => {
        const res = await authService.login(credentials);
        const { user, token } = res.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return user;
    };

    const logout = async () => {
        try { await authService.logout(); } catch { }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const hasRole = (...roles) => user && roles.includes(user.role);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
