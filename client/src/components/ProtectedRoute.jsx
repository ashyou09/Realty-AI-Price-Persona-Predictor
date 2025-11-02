import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
const { token } = useContext(AuthContext);

if (!token) {
    // If no token, redirect to the login page
    return <Navigate to="/login" replace />;
}

// If there is a token, show the page (the children)
return children;
}

export default ProtectedRoute;

