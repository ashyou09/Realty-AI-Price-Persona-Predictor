import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function UserPropertiesPage() {
    const navigate = useNavigate();
    const { userId } = useParams();
    const { user } = useContext(AuthContext);
    const [properties, setProperties] = useState([]);
    const [userName, setUserName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is admin
    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    // Fetch user properties
    useEffect(() => {
        fetchUserProperties();
    }, [userId]);

    const fetchUserProperties = async () => {
        try {
            setLoading(true);
            console.log('Fetching properties for userId:', userId);
            const url = `${API_BASE_URL}/admin/users/${userId}/properties`;
            console.log('API URL:', url);

            const res = await axios.get(url, {
                withCredentials: true
            });

            console.log('API Response:', res.data);

            if (res.data.success) {
                console.log('Properties received:', res.data.properties);
                console.log('User name:', res.data.userName);
                setProperties(res.data.properties);
                setUserName(res.data.userName);
                setError(null);
            } else {
                console.error('API returned success=false');
                setError('Failed to load properties');
            }
        } catch (err) {
            console.error('Error fetching user properties:', err);
            console.error('Error response:', err.response?.data);
            console.error('Error status:', err.response?.status);
            setError(err.response?.data?.message || 'Failed to load properties');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-600"></div>
                    <p className="mt-4 text-gray-600 text-lg">Loading properties...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center p-8 glass-card shadow-premium-lg max-w-md">
                    <p className="text-red-600 text-lg mb-4">❌ {error}</p>
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="btn-premium btn-ripple shadow-glow-indigo hover:scale-105 transition-transform"
                    >
                        ← Back to Users
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-cyan-50 via-blue-50 to-purple-50 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 animate-fade-in-down">
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="mb-4 px-4 py-2 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 rounded-lg transition-all duration-200 flex items-center gap-2 hover:scale-105"
                    >
                        ← Back to All Users
                    </button>
                    <h1 className="text-4xl font-bold text-gradient mb-2">
                        {userName}'s Saved Properties
                    </h1>
                    <p className="text-lg text-gray-600">
                        Total Properties: {properties.length}
                    </p>
                </div>

                {/* Properties Grid */}
                {properties.length === 0 ? (
                    <div className="glass-card p-12 text-center shadow-premium-lg animate-fade-in-up">
                        <div className="text-6xl mb-4 animate-pulse-slow">📭</div>
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Saved Properties</h3>
                        <p className="text-gray-600">This user hasn't saved any properties yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property, index) => (
                            <div key={property._id} className="card-premium card-3d p-6 hover:shadow-premium-lg transition-all duration-300 stagger-item" style={{ animationDelay: `${index * 0.1}s` }}>
                                <h3 className="text-xl font-bold text-gray-900 mb-4 truncate">{property.title}</h3>

                                <div className="space-y-3">
                                    {/* Price */}
                                    <div className="pb-3 border-b border-gray-200">
                                        <p className="text-sm text-gray-500 mb-1">Price</p>
                                        <p className="text-gradient text-2xl font-bold">
                                            ₹{property.price?.toLocaleString('en-IN')}
                                        </p>
                                    </div>

                                    {/* Property Details */}
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-gray-500">Area</p>
                                            <p className="font-semibold text-gray-900">📐 {property.sqft} sqft</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Bedrooms</p>
                                            <p className="font-semibold text-gray-900">🛏️ {property.bedrooms}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Bathrooms</p>
                                            <p className="font-semibold text-gray-900">🚿 {property.bathrooms}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Location Score</p>
                                            <p className="font-semibold text-gray-900">📍 {property.location_score}/10</p>
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    {property.age && (
                                        <div className="pt-2">
                                            <p className="text-sm text-gray-500">Property Age</p>
                                            <p className="font-semibold text-gray-900">🏠 {property.age} years</p>
                                        </div>
                                    )}

                                    {property.persona && (
                                        <div className="pt-2">
                                            <p className="text-sm text-gray-500">Buyer Persona</p>
                                            <p className="badge-premium inline-block">{property.persona}</p>
                                        </div>
                                    )}

                                    {/* Save Date */}
                                    <div className="pt-3 border-t border-gray-200">
                                        <p className="text-xs text-gray-500">
                                            Saved on {new Date(property.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
