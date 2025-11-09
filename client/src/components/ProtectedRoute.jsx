import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
const { token, user, loading } = useContext(AuthContext);

// Show loading state while verifying authentication
if (loading) {
    return (
    <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
        </div>
    </div>
    );
}

// Check if user is authenticated
// If user exists, we're authenticated (even if token is 'cookie-auth')
// If token exists and is not 'cookie-auth', we're authenticated
const isAuthenticated = user || (token && token !== 'cookie-auth' && token !== 'null' && token !== 'undefined');

console.log('ProtectedRoute check:', { 
    hasToken: !!token, 
    tokenType: typeof token,
    hasUser: !!user, 
    isAuthenticated 
});

// If not authenticated, redirect to the login page
if (!isAuthenticated) {
    console.log('Redirecting to login - not authenticated');
    return <Navigate to="/login" replace />;
}

// If authenticated, show the page (the children)
return children;
}

export default ProtectedRoute;

