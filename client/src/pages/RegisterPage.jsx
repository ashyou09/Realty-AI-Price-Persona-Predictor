import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!name || !email || !password) {
            setError('Please enter name, email and password');
            return;
        }
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const result = await register(name, email, password, 'user');
            console.log('Registration result:', result);
            if (result && result.success) {
                // Navigate immediately - AuthContext should have updated state
                navigate('/properties', { replace: true });
            } else {
                setError('Registration failed. Please try again.');
                setLoading(false);
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message || 'Registration failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-cyan-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">

            {/* Floating Orbs */}
            <div className="absolute top-20 right-20 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
            <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-delayed"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8 animate-fade-in-down">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Account</h1>
                    <p className="text-gray-600">Join RealtyAI and start your journey</p>
                </div>
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 animate-fade-in-up delay-200">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm animate-shake">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-semibold text-gray-700 mb-2"
                            >
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 glow-on-hover"
                                placeholder="John Doe"
                            />
                        </div>
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 glow-on-hover"
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
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 glow-on-hover"
                                placeholder="••••••••"
                            />
                            <div className="mt-2 flex items-center">
                                <input
                                    id="show-password"
                                    type="checkbox"
                                    checked={showPassword}
                                    onChange={(e) => setShowPassword(e.target.checked)}
                                    className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500 cursor-pointer"
                                />
                                <label
                                    htmlFor="show-password"
                                    className="ml-2 text-sm text-gray-700 cursor-pointer select-none"
                                >
                                    Show password
                                </label>
                            </div>
                            <p className="mt-2 text-xs text-gray-500">Must be at least 8 characters</p>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-3 font-semibold text-white bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg hover:from-cyan-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center btn-ripple hover:scale-105"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
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
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="font-semibold text-cyan-600 hover:text-cyan-500 transition-colors duration-200"
                            >
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
