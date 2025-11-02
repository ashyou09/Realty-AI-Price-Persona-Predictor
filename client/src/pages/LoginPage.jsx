import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

function LoginPage() {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [showPassword, setShowPassword] = useState(false);
const { login } = useContext(AuthContext);
const navigate = useNavigate();

const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
    alert('Please enter email and password');
    return;
    }
    const result = await login(email, password);
    if (result && result.success) {
    navigate(result.redirect);
    }
};

return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
    <div className="w-full max-w-md">
        <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-600">Sign in to your RealtyAI account</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
            <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
            >
                Email address
            </label>
            <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="you@example.com"
            />
            </div>
            <div>
            <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
            >
                Password
            </label>
            <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
            />
            <div className="mt-2 flex items-center">
                <input
                    id="show-password"
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <label
                    htmlFor="show-password"
                    className="ml-2 text-sm text-gray-700 cursor-pointer select-none"
                >
                    Show password
                </label>
            </div>
            </div>
            <button
            type="submit"
            className="w-full px-4 py-3 font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
            Sign In
            </button>
        </form>
        <div className="mt-6">
            <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
            </div>
            </div>
            <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
            >
                Create one here
            </Link>
            </p>
        </div>
        </div>
    </div>
    </div>
);
}

export default LoginPage;
