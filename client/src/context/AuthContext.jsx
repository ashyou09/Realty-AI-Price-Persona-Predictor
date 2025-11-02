import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// The URL of your backend server
const API_URL = 'http://localhost:5000/api/auth';

// 1. Create the Context
const AuthContext = createContext();

// 2. Create the Provider Component
function AuthProvider({ children }) {
const [token, setToken] = useState(localStorage.getItem('token'));

// 3. Check for token on initial load
useEffect(() => {
    if (token) {
    // Set token in axios headers for all future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
    } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
    }
}, [token]);

// 4. Register Function
const register = async (email, password) => {
    try {
    await axios.post(`${API_URL}/register`, { email, password });
    alert('Registration successful! Please log in.');
    return { success: true, redirect: '/login' };
    } catch (error) {
    console.error('Registration Error:', error.response?.data?.message || error.message);
    alert('Registration failed: ' + (error.response?.data?.message || 'Server error'));
    return { success: false };
    }
};

// 5. Login Function
const login = async (email, password) => {
    try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    const { token } = response.data;
    setToken(token); // This will trigger the useEffect
    return { success: true, redirect: '/dashboard' };
    } catch (error) {
    console.error('Login Error:', error.response?.data?.message || error.message);
    alert('Login failed: ' + (error.response?.data?.message || 'Invalid credentials'));
    return { success: false };
    }
};

// 6. Logout Function
const logout = () => {
    setToken(null); // This will trigger the useEffect
    return { redirect: '/login' };
};

return (
    <AuthContext.Provider value={{ token, login, logout, register }}>
    {children}
    </AuthContext.Provider>
);
}

export { AuthContext, AuthProvider };

