import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { AuthContext } from '../context/AuthContext';
import buildingImage from '../assets/p2.png';
// import rectangleImage from '../assets/p1.jpeg';

function HomePage() {
const { token, user } = useContext(AuthContext);
useNavigate();
const isAuthenticated = token || user;
const [stats, setStats] = useState({
    totalProperties: 0,
    totalValue: 0,
    totalUsers: 0,
    accuracy: 95
});
// Fetch stats from API
useEffect(() => {

    if (isAuthenticated) {
        fetchStats();
    }
}, [isAuthenticated]);

const fetchStats = async () => {
    try {
        const res = await axios.get(`${API_BASE_URL}/properties`, {
            withCredentials: true
        });
        if (res.data.success) {
            const properties = res.data.properties || [];
            const totalValue = properties.reduce((sum, p) => sum + (p.price || 0), 0);
            setStats({
                totalProperties: properties.length,
                totalValue: totalValue,
                totalUsers: 8400, // Static for now
                accuracy: 95
            });
        }
    } catch (err) {
        console.log('Could not fetch stats',err);
    }
};

return (
<div className="min-h-screen bg-white">
    {/* Hero Section */}
    <div className="relative bg-gradient-to-b from-[#81b4ff] via-[#dcfbff] to-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Text Content */}
            <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                We craft the future of real estate with AI.
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Leverage AI-powered insights to make smarter property decisions.
            </p>
            {!isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-4">
                <Link
                to="/register"
                    className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                Get Started
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>
                <Link
                to="/login"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-all duration-200"
                >
                Sign In
                </Link>
            </div>
            ) : (
            <Link
                to="/properties"
                className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
                See Properties
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
            </Link>
            )}
            </div>

            {/* Right Column - Image */}
            <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img 
                src={buildingImage} 
                alt="Modern building" 
                className="w-150 h-150"
                />
            </div>
            </div>
        </div>
        </div>
    </div>

    {/* Statistics Section */}
    <div className="bg-gradient-to-b from-[#ffffff] to-[#e3e3ff] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Total Properties Analyzed */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                </div>
                <div>
                <p className="text-3xl font-bold text-gray-900">
                    {isAuthenticated ? stats.totalProperties.toLocaleString() : '7,738'}+
                </p>
                <p className="text-sm text-gray-600 mt-1">Total Properties Analyzed</p>
                </div>
            </div>
            </div>

            {/* Predictions Made Value */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                </div>
                <div>
                <p className="text-3xl font-bold text-gray-900">
                    {isAuthenticated 
                        ? `₹${(stats.totalValue / 10000000).toFixed(1)}Cr+`
                        : '₹13.5Cr+'
                    }
                </p>
                <p className="text-sm text-gray-600 mt-1">Predictions Made Value</p>
                </div>
            </div>
            </div>

            {/* Satisfied Users */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                </div>
                <div>
                <p className="text-3xl font-bold text-gray-900">8.4K+</p>
                <p className="text-sm text-gray-600 mt-1">Satisfied Users</p>
                </div>
            </div>
            </div>

            {/* Prediction Accuracy */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                </div>
                <div>
                <p className="text-3xl font-bold text-gray-900">{stats.accuracy}%</p>
                <p className="text-sm text-gray-600 mt-1">Prediction Accuracy</p>
                </div>
            </div>
            </div>
        </div>
        </div>
    </div>

    {/* Why Choose RealtyAI Section */}
    <div id="why-choose" className="bg-[#e3e3ff] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose RealtyAI?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the powerful features that make RealtyAI the smartest choice for property analysis
            </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* AI-Powered Insights */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Insights</h3>
            <p className="text-gray-600 leading-relaxed">
                Advanced machine learning algorithms analyze market trends and provide accurate predictions.
            </p>
        </div>

            {/* Fast Market Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Market Analysis</h3>
            <p className="text-gray-600 leading-relaxed">
                Get instant property valuations and market insights in seconds, not days.
            </p>
        </div>

            {/* Secure & Private Data */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Private Data</h3>
            <p className="text-gray-600 leading-relaxed">
                Your data is encrypted and protected with enterprise-grade security measures.
            </p>
            </div>

            {/* Smart Portfolio Management */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Portfolio Management</h3>
            <p className="text-gray-600 leading-relaxed">
                Track and manage your entire property portfolio with intelligent analytics.
            </p>
            </div>
        </div>
        </div>
    </div>

    {/* Our Services Section */}
    <div className="bg-[#e3e3ff] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive AI-powered solutions for all your real estate needs
            </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            {/* Property Valuation */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Property Valuation</h3>
            <p className="text-gray-600 mb-6">
                Get accurate, AI-powered property valuations based on real-time market data and historical trends.
            </p>
            <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                Instant valuations
                </li>
                <li className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                Market comparisons
                </li>
                <li className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                Historical analysis
                </li>
            </ul>
            </div>

            {/* Market Predictions */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 bg-purple-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Market Predictions</h3>
            <p className="text-gray-600 mb-6">
                Forecast future property values and market trends with advanced machine learning algorithms.
            </p>
            <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                Price forecasting
                </li>
                <li className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                Trend analysis
                </li>
                <li className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-3"></span>
                Risk assessment
                </li>
            </ul>
            </div>

            {/* Smart Investment Insights */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="w-16 h-16 bg-orange-600 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Smart Investment Insights</h3>
            <p className="text-gray-600 mb-6">
                Receive personalized investment recommendations based on your portfolio and market conditions.
            </p>
            <ul className="space-y-2">
                <li className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-orange-600 rounded-full mr-3"></span>
                ROI calculations
                </li>
                <li className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-orange-600 rounded-full mr-3"></span>
                Portfolio tracking
                </li>
                <li className="flex items-center text-gray-700">
                <span className="w-2 h-2 bg-orange-600 rounded-full mr-3"></span>
                Investment scoring
                </li>
            </ul>
            </div>
        </div>
        </div>
    </div>

    {/* Testimonials Section */}
    <div id="testimonials" className="bg-gradient-to-b from-[#e3e3ff] to-[#e3e3ff] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
            <p className="text-lg text-gray-600">
            Trusted by thousands of property professionals and investors
            </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-4">
            {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed">
                "RealtyAI has transformed how I analyze properties. The AI predictions are incredibly accurate and have helped me make better investment decisions."
            </p>
            <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                SJ
            </div>
            <div>
                <p className="font-semibold text-gray-900">Sarah Johnson</p>
                <p className="text-sm text-gray-600">Real Estate Investor</p>
            </div>
            </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-4">
            {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed">
                "The speed and accuracy of RealtyAI is unmatched. It saves me hours of research and provides insights I would have missed otherwise."
            </p>
            <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                MC
            </div>
            <div>
                <p className="font-semibold text-gray-900">Michael Chen</p>
                <p className="text-sm text-gray-600">Property Developer</p>
            </div>
            </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center mb-4">
            {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed">
                "As a first-time buyer, RealtyAI gave me the confidence to make informed decisions. The interface is intuitive and the insights are invaluable."
            </p>
            <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                PS
            </div>
            <div>
                <p className="font-semibold text-gray-900">Priya Sharma</p>
                <p className="text-sm text-gray-600">First-time Homebuyer</p>
            </div>
            </div>
            </div>
        </div>
        </div>
    </div>

    {/* CTA Section */}
    <div className="relative bg-gradient-to-b from-[#e3e3ff] via-[#a58bff] to-[#4f28dd] py-0 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Start Your Smart Property Journey Now!</h2>
        <p className="text-xl text-indigo-100 mb-8">
            Join thousands of investors and professionals who trust RealtyAI for intelligent property decisions
        </p>
        {!isAuthenticated ? (
            <Link
            to="/register"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
            Get Started
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            </Link>
        ) : (
            <Link
            to="/properties"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
            Explore Properties
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            </Link>
        )}
        </div>
    </div>
</div>
);
}

export default HomePage;
