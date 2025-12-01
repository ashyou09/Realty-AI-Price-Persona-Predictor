import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
const { token, user, logout } = useContext(AuthContext);
const navigate = useNavigate();
const [dropdownOpen, setDropdownOpen] = useState(false);
const dropdownRef = useRef(null);

const handleLogout = async () => {
    const result = await logout();
    if (result && result.redirect) {
    navigate(result.redirect);
    }
    setDropdownOpen(false);
};

// Close dropdown when clicking outside
useEffect(() => {
    const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
    }
    };

    if (dropdownOpen) {
    document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
    document.removeEventListener('mousedown', handleClickOutside);
    };
}, [dropdownOpen]);

return (
    <nav className="relative bg-gradient-to-b from-[#5096ff] via-[#a0d6ff] py-20 lg:py-3">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
        <Link to="/" className="flex items-center space-x-2 group">
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:from-indigo-700 group-hover:to-purple-700 transition-all duration-200">
            EstateVerse
            </div>
        </Link>

        <div className="flex items-center space-x-6">
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
                <Link
                to="/"
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                >
                Home
                </Link>
                {token || user ? (
                <>
                    <Link
                    to="/dashboard"
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                    >
                    Prediction
                    </Link>
                    <Link
                    to="/properties"
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                    >
                    Properties
                    </Link>
                </>
                ) : null}
                <button
                onClick={() => {
                    if (window.location.pathname === '/') {
                        const element = document.getElementById('why-choose');
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    } else {
                        navigate('/');
                        setTimeout(() => {
                            const element = document.getElementById('why-choose');
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }, 100);
                    }
                }}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                >
                About
                </button>
                <button
                onClick={() => {
                    if (window.location.pathname === '/') {
                        const element = document.getElementById('testimonials');
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    } else {
                        navigate('/');
                        setTimeout(() => {
                            const element = document.getElementById('testimonials');
                            if (element) {
                                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                        }, 100);
                    }
                }}
                className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                >
                Reviews
                </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
            {token || user ? (
            <>
                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-indigo-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="hidden md:block">{user?.name || 'User'}</span>
                    <svg
                    className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                        {user?.role === 'admin' && (
                            <p className="text-xs text-red-600 font-semibold mt-1">👨‍💼 Admin</p>
                        )}
                    </div>
                    {user?.role === 'admin' && (
                        <>
                            <Link
                                to="/admin/users"
                                className="w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 transition-colors duration-200 flex items-center space-x-2 border-b border-gray-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM6 20a9 9 0 0118 0v2h2v-2a11 11 0 00-22 0v2h2v-2z" />
                                </svg>
                                <span>All Users</span>
                            </Link>
                        </>
                    )}
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center space-x-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Logout</span>
                    </button>
                    </div>
                )}
                </div>
            </>
            ) : (
            <>
                <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                >
                Login
                </Link>
                <Link
                to="/register"
                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                Get Started
                </Link>
            </>
            )}
            </div>
        </div>
        </div>
    </div>
    </nav>
);
}

export default Navbar;

