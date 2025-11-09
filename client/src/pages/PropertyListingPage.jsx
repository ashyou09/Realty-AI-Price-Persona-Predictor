import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// Import property images
import N1 from '../assets/N1.jpeg';
import N2 from '../assets/N2.jpeg';
import N3 from '../assets/N3.jpeg';
import N4 from '../assets/N4.jpeg';
import N5 from '../assets/N5.jpeg';
import N7 from '../assets/N7.jpeg';
import N8 from '../assets/N8.jpeg';

// Array of all property images
const propertyImages = [N1, N2, N3, N4, N5, N7, N8];

// Function to get a random image for a property (consistent based on property ID)
const getPropertyImage = (propertyId) => {
    if (!propertyId) return propertyImages[0];
    // Use property ID to get consistent image (hash-like behavior)
    const index = propertyId.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % propertyImages.length;
    return propertyImages[index];
};

export default function PropertyListingPage() {
    const navigate = useNavigate();
    const [properties, setProperties] = useState([]);
    const [filteredProperties, setFilteredProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Sorting state
    const [sortBy, setSortBy] = useState('price'); // price, area, bedrooms, price_sqft
    const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
    
    // Filtering state
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        minArea: '',
        maxArea: '',
        bedrooms: '',
        status: '',
        furnished: '',
        buildingType: ''
    });
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;
    
    // Property detail modal
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Like/Save property state
    const [savingProperty, setSavingProperty] = useState(null);
    const [savedProperties, setSavedProperties] = useState(new Set());

    // Fetch properties
    useEffect(() => {
        fetchProperties();
    }, []);

    // Fetch saved properties to show which ones are already saved
    const fetchSavedProperties = async () => {
        try {
            const res = await axios.get('/api/properties', {
                withCredentials: true
            });
            if (res.data.success && res.data.properties && properties.length > 0) {
                // Match saved properties with housing properties by address/title
                const savedTitles = new Set(
                    res.data.properties
                        .filter(p => p.source === 'wishlist') // Only match wishlist properties
                        .map(p => p.title?.toLowerCase().trim())
                );
                
                // Find matching housing properties
                const matchedIds = new Set();
                properties.forEach(prop => {
                    const propTitle = (prop.address || '').toLowerCase().trim();
                    if (savedTitles.has(propTitle)) {
                        matchedIds.add(prop.id);
                    }
                });
                
                setSavedProperties(matchedIds);
            }
        } catch (err) {
            // Silently fail - user might not be logged in
            console.log('Could not fetch saved properties:', err);
        }
    };

    // Apply filters and sorting
    useEffect(() => {
        applyFiltersAndSort();
    }, [properties, filters, sortBy, sortOrder]);

    // Re-fetch saved properties when properties list is loaded
    useEffect(() => {
        if (properties.length > 0 && !loading) {
            fetchSavedProperties();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [properties.length, loading]);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/housing');
            if (res.data.success) {
                setProperties(res.data.properties || []);
                setError(null);
            } else {
                setError('Failed to fetch properties');
            }
        } catch (err) {
            console.error('Error fetching properties:', err);
            setError('Failed to load properties');
        } finally {
            setLoading(false);
        }
    };

    const applyFiltersAndSort = () => {
        let filtered = [...properties];

        // Apply filters
        if (filters.minPrice) {
            filtered = filtered.filter(p => p.price >= parseFloat(filters.minPrice));
        }
        if (filters.maxPrice) {
            filtered = filtered.filter(p => p.price <= parseFloat(filters.maxPrice));
        }
        if (filters.minArea) {
            filtered = filtered.filter(p => p.area >= parseFloat(filters.minArea));
        }
        if (filters.maxArea) {
            filtered = filtered.filter(p => p.area <= parseFloat(filters.maxArea));
        }
        if (filters.bedrooms) {
            filtered = filtered.filter(p => p.bedrooms === parseFloat(filters.bedrooms));
        }
        if (filters.status) {
            filtered = filtered.filter(p => p.status === filters.status);
        }
        if (filters.furnished) {
            filtered = filtered.filter(p => p.furnished_status === filters.furnished);
        }
        if (filters.buildingType) {
            filtered = filtered.filter(p => p.type_of_building === filters.buildingType);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aVal = a[sortBy] || 0;
            let bVal = b[sortBy] || 0;

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        setFilteredProperties(filtered);
        setCurrentPage(1); // Reset to first page when filters change
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const clearFilters = () => {
        setFilters({
            minPrice: '',
            maxPrice: '',
            minArea: '',
            maxArea: '',
            bedrooms: '',
            status: '',
            furnished: '',
            buildingType: ''
        });
    };

    const handlePropertyClick = (property) => {
        setSelectedProperty(property);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProperty(null);
    };

    const handleLikeProperty = async (property, e) => {
        e.stopPropagation(); // Prevent opening modal when clicking like button
        
        if (savingProperty === property.id) return; // Already saving
        
        try {
            setSavingProperty(property.id);
            
            // Map housing property to property model format
            // Estimate location_score based on price (higher price = better location)
            // Scale price to 1-10 range (assuming max price around 50Cr = 500000000)
            const maxPrice = 500000000;
            const locationScore = Math.max(1, Math.min(10, Math.round((property.price / maxPrice) * 10) || 5));
            
            // Estimate age (default to 0 for new properties, or use status)
            const age = property.status === 'Ready to Move' ? 0 : 2;
            
            const propertyData = {
                title: property.address || `Property ${property.id}`,
                sqft: property.area || 0,
                bedrooms: property.bedrooms || 0,
                bathrooms: property.bathrooms || 0,
                location_score: locationScore,
                age: age,
                price: property.price || 0,
                source: 'wishlist', // Mark as wishlist property
                isAiGenerated: false // Not AI-generated
            };

            const res = await axios.post('/api/properties', propertyData, {
                withCredentials: true
            });

            if (res.data.success) {
                setSavedProperties(prev => new Set([...prev, property.id]));
                // Show success message
                alert('✅ Property saved to My Properties!');
                // Refresh saved properties list to ensure consistency
                fetchSavedProperties();
            } else {
                alert('Failed to save property: ' + (res.data.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Error saving property:', err);
            if (err.response?.status === 401) {
                alert('Please login to save properties');
            } else {
                alert('Failed to save property: ' + (err.response?.data?.message || err.message));
            }
        } finally {
            setSavingProperty(null);
        }
    };

    // Pagination
    const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProperties = filteredProperties.slice(startIndex, endIndex);

    // Get unique values for filter dropdowns
    const uniqueStatuses = [...new Set(properties.map(p => p.status).filter(Boolean))];
    const uniqueFurnished = [...new Set(properties.map(p => p.furnished_status).filter(Boolean))];
    const uniqueBuildingTypes = [...new Set(properties.map(p => p.type_of_building).filter(Boolean))];

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
                    <p className="mt-4 text-gray-600 text-lg">Loading properties...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-lg shadow-lg">
                    <p className="text-red-600 text-lg mb-4">❌ {error}</p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative bg-gradient-to-b from-[#b3daff00] to-[#fff9f9] py-20 lg:py-22">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                🏘️ Property Listings
                            </h1>
                            <p className="text-lg text-gray-600">
                                Explore {properties.length.toLocaleString()} properties with advanced filtering
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>

                {/* Filters and Sort Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Filters & Sorting</h2>
                            <button
                                onClick={clearFilters}
                                className="text-sm text-indigo-600 hover:text-indigo-700"
                            >
                                Clear All Filters
                            </button>
                        </div>

                        {/* Filter Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₹)</label>
                                <input
                                    type="number"
                                    value={filters.minPrice}
                                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                                    placeholder="Min"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₹)</label>
                                <input
                                    type="number"
                                    value={filters.maxPrice}
                                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                                    placeholder="Max"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Min Area (sqft)</label>
                                <input
                                    type="number"
                                    value={filters.minArea}
                                    onChange={(e) => handleFilterChange('minArea', e.target.value)}
                                    placeholder="Min"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max Area (sqft)</label>
                                <input
                                    type="number"
                                    value={filters.maxArea}
                                    onChange={(e) => handleFilterChange('maxArea', e.target.value)}
                                    placeholder="Max"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                                <select
                                    value={filters.bedrooms}
                                    onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">All</option>
                                    <option value="1">1 BHK</option>
                                    <option value="2">2 BHK</option>
                                    <option value="3">3 BHK</option>
                                    <option value="4">4 BHK</option>
                                    <option value="5">5+ BHK</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">All</option>
                                    {uniqueStatuses.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Furnishing</label>
                                <select
                                    value={filters.furnished}
                                    onChange={(e) => handleFilterChange('furnished', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">All</option>
                                    {uniqueFurnished.map(f => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Building Type</label>
                                <select
                                    value={filters.buildingType}
                                    onChange={(e) => handleFilterChange('buildingType', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">All</option>
                                    {uniqueBuildingTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Sort Buttons */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm font-medium text-gray-700">Sort by:</span>
                            <button
                                onClick={() => handleSort('price')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    sortBy === 'price'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </button>
                            <button
                                onClick={() => handleSort('area')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    sortBy === 'area'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Area {sortBy === 'area' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </button>
                            <button
                                onClick={() => handleSort('bedrooms')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    sortBy === 'bedrooms'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Bedrooms {sortBy === 'bedrooms' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </button>
                            <button
                                onClick={() => handleSort('price_sqft')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    sortBy === 'price_sqft'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Price/sqft {sortBy === 'price_sqft' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </button>
                        </div>
                    </div>

                    {/* Results Count */}
                    <div className="pt-4 border-t">
                        <p className="text-sm text-gray-600">
                            Showing <span className="font-semibold text-indigo-600">{filteredProperties.length}</span> of{' '}
                            <span className="font-semibold">{properties.length}</span> properties
                        </p>
                    </div>
                </div>

                {/* Properties Grid */}
                {currentProperties.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <p className="text-gray-600 text-lg">No properties match your filters</p>
                        <button
                            onClick={clearFilters}
                            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {currentProperties.map((property) => (
                                <div
                                    key={property.id}
                                    onClick={() => handlePropertyClick(property)}
                                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 cursor-pointer group relative"
                                >
                                    {/* Property Image */}
                                    <div className="relative w-full h-56 overflow-hidden bg-gray-200">
                                        <img 
                                            src={getPropertyImage(property.id)} 
                                            alt={property.address || 'Property'}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        {/* Like Button */}
                                        <button
                                            onClick={(e) => handleLikeProperty(property, e)}
                                            disabled={savingProperty === property.id || savedProperties.has(property.id)}
                                            className={`absolute top-4 right-4 z-10 p-2 rounded-full shadow-lg transition-all duration-200 ${
                                                savedProperties.has(property.id)
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-600'
                                            } ${savingProperty === property.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            title={savedProperties.has(property.id) ? 'Saved to My Properties' : 'Save to My Properties'}
                                        >
                                            {savingProperty === property.id ? (
                                                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                            ) : savedProperties.has(property.id) ? (
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    
                                    <div className="p-6">
                                        {/* Header */}
                                        <div className="mb-4">
                                            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                                                {property.address || 'Property'}
                                            </h3>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {property.status && (
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                        {property.status}
                                                    </span>
                                                )}
                                                {property.furnished_status && (
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                        {property.furnished_status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="mb-4">
                                            <p className="text-3xl font-bold text-indigo-600">
                                                ₹{property.price?.toLocaleString('en-IN')}
                                            </p>
                                            {property.price_sqft > 0 && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    ₹{property.price_sqft.toLocaleString('en-IN')}/sqft
                                                </p>
                                            )}
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 gap-3 mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500">📐</span>
                                                <div>
                                                    <p className="text-xs text-gray-500">Area</p>
                                                    <p className="text-sm font-semibold">{property.area} sqft</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500">🛏️</span>
                                                <div>
                                                    <p className="text-xs text-gray-500">Bedrooms</p>
                                                    <p className="text-sm font-semibold">{property.bedrooms || 'N/A'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500">🚿</span>
                                                <div>
                                                    <p className="text-xs text-gray-500">Bathrooms</p>
                                                    <p className="text-sm font-semibold">{property.bathrooms || 'N/A'}</p>
                                                </div>
                                            </div>
                                            {property.parking && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500">🚗</span>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Parking</p>
                                                        <p className="text-sm font-semibold">{property.parking}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Additional Info */}
                                        {property.type_of_building && (
                                            <p className="text-sm text-gray-600 mb-2">
                                                <span className="font-medium">Type:</span> {property.type_of_building}
                                            </p>
                                        )}
                                        {property.neworold && (
                                            <p className="text-sm text-gray-600 mb-3">
                                                <span className="font-medium">Property:</span> {property.neworold}
                                            </p>
                                        )}
                                        
                                        {/* Click hint */}
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <p className="text-xs text-indigo-600 font-medium group-hover:text-indigo-700 transition-colors">
                                                Click to view details →
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-white rounded-lg shadow border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 text-gray-700">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-white rounded-lg shadow border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Property Detail Modal */}
            {isModalOpen && selectedProperty && (
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                onClick={closeModal}
            >
                <div 
                    className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                        <h2 className="text-2xl font-bold text-gray-900">Property Details</h2>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleLikeProperty(selectedProperty, e);
                                }}
                                disabled={savingProperty === selectedProperty?.id || savedProperties.has(selectedProperty?.id)}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                                    savedProperties.has(selectedProperty?.id)
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
                                } ${savingProperty === selectedProperty?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={savedProperties.has(selectedProperty?.id) ? 'Saved to My Properties' : 'Save to My Properties'}
                            >
                                {savingProperty === selectedProperty?.id ? (
                                    <>
                                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Saving...
                                    </>
                                ) : savedProperties.has(selectedProperty?.id) ? (
                                    <>
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                        </svg>
                                        Saved
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        Save to My Properties
                                    </>
                                )}
                            </button>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    {/* Modal Content */}
                    <div className="p-6">
                        {/* Address */}
                        <div className="mb-6">
                            <h3 className="text-3xl font-bold text-gray-900 mb-3">
                                {selectedProperty.address || 'Property'}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap">
                                {selectedProperty.status && (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                                        {selectedProperty.status}
                                    </span>
                                )}
                                {selectedProperty.furnished_status && (
                                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                                        {selectedProperty.furnished_status}
                                    </span>
                                )}
                                {selectedProperty.neworold && (
                                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full font-medium">
                                        {selectedProperty.neworold}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Price Section */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 mb-6">
                            <div className="flex items-baseline gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Price</p>
                                    <p className="text-4xl font-bold text-indigo-600">
                                        ₹{selectedProperty.price?.toLocaleString('en-IN')}
                                    </p>
                                </div>
                                {selectedProperty.price_sqft > 0 && (
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">Price per sqft</p>
                                        <p className="text-2xl font-semibold text-gray-700">
                                            ₹{selectedProperty.price_sqft.toLocaleString('en-IN')}/sqft
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">📐 Area</p>
                                <p className="text-xl font-bold text-gray-900">{selectedProperty.area} sqft</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">🛏️ Bedrooms</p>
                                <p className="text-xl font-bold text-gray-900">{selectedProperty.bedrooms || 'N/A'}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-600 mb-1">🚿 Bathrooms</p>
                                <p className="text-xl font-bold text-gray-900">{selectedProperty.bathrooms || 'N/A'}</p>
                            </div>
                            {selectedProperty.parking && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600 mb-1">🚗 Parking</p>
                                    <p className="text-xl font-bold text-gray-900">{selectedProperty.parking}</p>
                                </div>
                            )}
                        </div>

                        {/* Additional Information */}
                        <div className="space-y-4 mb-6">
                            {selectedProperty.type_of_building && (
                                <div className="flex items-start gap-3">
                                    <span className="font-semibold text-gray-700 min-w-[120px]">Building Type:</span>
                                    <span className="text-gray-600">{selectedProperty.type_of_building}</span>
                                </div>
                            )}
                            {selectedProperty.balcony && (
                                <div className="flex items-start gap-3">
                                    <span className="font-semibold text-gray-700 min-w-[120px]">Balcony:</span>
                                    <span className="text-gray-600">{selectedProperty.balcony}</span>
                                </div>
                            )}
                            {selectedProperty.lift && (
                                <div className="flex items-start gap-3">
                                    <span className="font-semibold text-gray-700 min-w-[120px]">Lift:</span>
                                    <span className="text-gray-600">{selectedProperty.lift}</span>
                                </div>
                            )}
                            {selectedProperty.landmarks && (
                                <div className="flex items-start gap-3">
                                    <span className="font-semibold text-gray-700 min-w-[120px]">Landmarks:</span>
                                    <span className="text-gray-600">{selectedProperty.landmarks}</span>
                                </div>
                            )}
                            {(selectedProperty.latitude && selectedProperty.longitude) && (
                                <div className="flex items-start gap-3">
                                    <span className="font-semibold text-gray-700 min-w-[120px]">Location:</span>
                                    <span className="text-gray-600">
                                        {selectedProperty.latitude.toFixed(6)}, {selectedProperty.longitude.toFixed(6)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {selectedProperty.description && (
                            <div className="mb-6">
                                <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {selectedProperty.description}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
                                onClick={closeModal}
                                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            )}
        </div>
    );
}

