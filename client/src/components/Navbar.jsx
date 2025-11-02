import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
const { token, logout } = useContext(AuthContext);
const navigate = useNavigate();

const handleLogout = () => {
    const result = logout();
    if (result && result.redirect) {
    navigate(result.redirect);
    }
};

return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
        <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Realty<span className="text-indigo-600">AI</span>
            </div>
        </Link>

        <div className="flex items-center space-x-4">
            {token ? (
            <>
                <Link
                to="/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200 rounded-md hover:bg-indigo-50"
                >
                Dashboard
                </Link>
                <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                >
                Logout
                </button>
            </>
            ) : (
            <>
                <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200 rounded-md hover:bg-indigo-50"
                >
                Login
                </Link>
                <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
                >
                Register
                </Link>
            </>
            )}
        </div>
        </div>
    </div>
    </nav>
);
}

export default Navbar;

