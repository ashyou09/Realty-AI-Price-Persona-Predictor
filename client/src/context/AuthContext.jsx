import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Check if running in development
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// The URL of your backend server
// Use relative paths in development (proxied by Vite), absolute URL in production
const API_URL = isDevelopment 
? '/api/auth' 
: 'https://realty-ai-price-persona-predictor.onrender.com/api/auth';

// Configure axios
// Always enable credentials so cookies are sent with every request
// This allows the server to maintain session via cookies
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// 1. Create the Context
const AuthContext = createContext();

// 2. Create the Provider Component
function AuthProvider({ children }) {
const [token, setToken] = useState(localStorage.getItem('token'));
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);

// 3. Verify authentication on mount
useEffect(() => {
    verifyAuth();
}, []);

// 4. Check for token on change
useEffect(() => {
    if (token && token !== 'cookie-auth' && token !== 'null' && token !== 'undefined') {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
    } else if (!token) {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
    if (!user) {
        setUser(null);
    }
    }
}, [token, user]);

// Verify authentication status
const verifyAuth = async () => {
    try {
    const existingToken = localStorage.getItem('token');
    
    // Create axios instance with token if available
    const verifyConfig = {};
    if (existingToken && existingToken !== 'null' && existingToken !== 'undefined') {
        verifyConfig.headers = {
        'Authorization': `Bearer ${existingToken}`
        };
    }
    
    const response = await axios.get(`${API_URL}/verify`, verifyConfig);
    if (response.data.success && response.data.user) {
        setUser(response.data.user);
        // If we have a token from localStorage, use it
        if (existingToken && existingToken !== 'null' && existingToken !== 'undefined') {
        setToken(existingToken);
        } else {
        // User authenticated but no localStorage token - this is cookie-based auth
        setToken('cookie-auth');
        }
    } else {
        setToken(null);
        setUser(null);
    }
    } catch (error) {
    console.error('Verify Auth Error:', error.response?.data || error.message || error);
    setToken(null);
    setUser(null);
    } finally {
    setLoading(false);
    }
};

// 5. Register Function
const register = async (name, email, password) => {
    try {
    console.log('Registering user:', { name, email });
    const response = await axios.post(`${API_URL}/register`, { name, email, password });
    console.log('Registration response:', response.data);
    if (response.data.success) {
        const { token: newToken, user: newUser } = response.data;
        console.log('Setting token and user:', { token: newToken ? 'present' : 'missing', user: newUser });
        // Set token and user state immediately and sync with localStorage
        if (newToken) {
        setToken(newToken);
        localStorage.setItem('token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        }
        if (newUser) {
        setUser(newUser);
        }
        return { success: true, redirect: '/properties' };
    }
    return { success: false };
    } catch (error) {
    console.error('Registration Error:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || error.message || 'Server error';
    throw new Error(errorMessage);
    }
};

// 6. Login Function
const login = async (email, password) => {
    try {
    console.log('Logging in user:', { email });
    const response = await axios.post(`${API_URL}/login`, { email, password });
    console.log('Login response:', response.data);
    if (response.data.success) {
        const { token: newToken, user: newUser } = response.data;
        console.log('Setting token and user:', { token: newToken ? 'present' : 'missing', user: newUser });
        // Set token and user state immediately and sync with localStorage
        if (newToken) {
        setToken(newToken);
        localStorage.setItem('token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        }
        if (newUser) {
        setUser(newUser);
        }
        return { success: true, redirect: '/properties' };
    }
    return { success: false };
    } catch (error) {
    console.error('Login Error:', error.response?.data || error.message);
    const errorMessage = error.response?.data?.message || error.message || 'Invalid credentials';
    throw new Error(errorMessage);
    }
};

// 7. Logout Function
const logout = async () => {
    try {
    await axios.post(`${API_URL}/logout`);
    setToken(null);
    setUser(null);
    return { redirect: '/login' };
    } catch (error) {
    console.error('Logout Error:', error);
    // Even if logout fails, clear local state
    setToken(null);
    setUser(null);
    return { redirect: '/login' };
    }
};

return (
    <AuthContext.Provider value={{ token, user, login, logout, register, loading }}>
    {children}
    </AuthContext.Provider>
);
}

export { AuthContext, AuthProvider };

