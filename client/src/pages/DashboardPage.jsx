import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import PricePredictor from './PricePredictor';
import PropertyList from '../components/PropertyList';
import AddPropertyModal from '../components/AddPropertyModal';

function DashboardPage() {
const { user, token } = useContext(AuthContext);
const navigate = useNavigate();
const [properties, setProperties] = useState([]);
const [loading, setLoading] = useState(true);
const [refreshTrigger, setRefreshTrigger] = useState(0);
const [isAddModalOpen, setIsAddModalOpen] = useState(false);

// Fetch properties on mount and when refreshTrigger changes
useEffect(() => {
    fetchProperties();
}, [refreshTrigger, token]);

const fetchProperties = async () => {
    if (!token && !user) return;
    
    try {
        setLoading(true);
        const res = await axios.get('/api/properties', {
            withCredentials: true
        });
        if (res.data.success) {
            setProperties(res.data.properties || []);
        }
    } catch (err) {
        console.error('Error fetching properties:', err);
        setProperties([]);
    } finally {
        setLoading(false);
    }
};

// Function to trigger refresh (called after property is saved)
const handlePropertySaved = () => {
    setRefreshTrigger(prev => prev + 1);
};

return (
    <div className="relative bg-gradient-to-b from-[#b3daff00] to-[#fff9f9] py-20 lg:py-22">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
        <div className="flex items-center justify-between">
            <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                💰 Price Predictor
            </h1>
            <p className="text-lg text-gray-600">
                Predict property prices using AI and manage your saved properties.
            </p>
            </div>
            <div className="hidden md:flex items-center space-x-3">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            </div>
        </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-500 hover:shadow-xl transition-shadow duration-200 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Properties</p>
                <p className="text-4xl font-bold text-gray-900 mt-3">{loading ? '...' : properties.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                    {properties.length === 0 ? 'No properties yet' : `${properties.length} property${properties.length !== 1 ? 'ies' : ''}`}
                </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center shadow-inner">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            </div>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow duration-200 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Value</p>
                <p className="text-4xl font-bold text-gray-900 mt-3">
                    {loading ? '...' : (() => {
                        const totalValue = properties.reduce((sum, p) => {
                            const price = typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0;
                            return sum + price;
                        }, 0);
                        if (totalValue === 0) return '₹0';
                        const crores = totalValue / 10000000;
                        return `₹${crores.toFixed(2)}Cr`;
                    })()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    {properties.length === 0 ? 'Start analyzing' : 'Portfolio value'}
                </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center shadow-inner">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            </div>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-500 hover:shadow-xl transition-shadow duration-200 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">AI Insights</p>
                <p className="text-4xl font-bold text-gray-900 mt-3">
                    {loading ? '...' : properties.filter(p => p.isAiGenerated).length}
                </p>
                <p className="text-xs text-gray-500 mt-1">AI powered predictions</p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-200 rounded-xl flex items-center justify-center shadow-inner">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            </div>
            </div>
        </div>
        </div>

        {/* Price Predictor */}
        <div className="mb-8">
        <PricePredictor onPropertySaved={handlePropertySaved} />
        </div>

        {/* Properties List */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">My Properties</h2>
            <div className="flex gap-3">
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#3ed83e] rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
                >
                    ➕ Add Property
                </button>
                <button 
                    onClick={() => navigate('/properties')}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#665fe0] rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                    🏘️ Browse Properties
                </button>
                <button 
                    onClick={() => setRefreshTrigger(prev => prev + 1)}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-200"
                >
                    Refresh
                </button>
            </div>
        </div>
        
        {loading ? (
            <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-gray-600">Loading properties...</p>
            </div>
        ) : properties.length === 0 ? (
            <div className="text-center py-16">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="h-10 w-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties yet</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                Get started by predicting and saving your first property above.
                </p>
            </div>
        ) : (
            <PropertyList 
                refreshTrigger={refreshTrigger} 
                onPropertyChange={() => setRefreshTrigger(prev => prev + 1)}
            />
        )}
        </div>

        {/* Add Property Modal */}
        <AddPropertyModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSuccess={() => {
                setRefreshTrigger(prev => prev + 1);
            }}
        />
    </div>
    </div>
);
}

export default DashboardPage;
