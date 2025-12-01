import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { AuthContext } from '../context/AuthContext';
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

export default function PropertyList({ refreshTrigger, onPropertyChange, onEditProperty }) {
    const { user } = useContext(AuthContext);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState('createdAt'); // createdAt, price, sqft
    const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
    const [filterPrice, setFilterPrice] = useState({ min: '', max: '' });

    // Fetch properties when component mounts or refreshTrigger changes
    useEffect(() => {
        fetchProperties();
    }, [refreshTrigger]);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/properties`, {
                withCredentials: true
            });
            if (res.data.success) {
                setProperties(res.data.properties || []);
                setError(null);
            } else {
                setError('Failed to fetch properties');
            }
        } catch (err) {
            console.error('Error fetching properties:', err);
            setError('Failed to load properties');
            setProperties([]);
        } finally {
            setLoading(false);
        }
    };

    // Sort properties
    const sortedProperties = [...properties].sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];

        if (sortBy === 'createdAt') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        }

        if (sortOrder === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });

    // Filter by price
    const filteredProperties = sortedProperties.filter(prop => {
        if (filterPrice.min && prop.price < parseFloat(filterPrice.min)) return false;
        if (filterPrice.max && prop.price > parseFloat(filterPrice.max)) return false;
        return true;
    });

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this property?')) {
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/properties/${id}`, {
                withCredentials: true
            });
            fetchProperties(); // Refresh list
            // Notify parent to refresh its property count
            if (onPropertyChange) {
                onPropertyChange();
            }
        } catch (err) {
            console.error('Error deleting property:', err);
            alert('Failed to delete property');
        }
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <p className="mt-2 text-gray-600">Loading properties...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-600">
                ❌ {error}
            </div>
        );
    }

    if (filteredProperties.length === 0 && properties.length > 0) {
        return (
            <div className="space-y-4">
                {/* Sort and Filter Controls */}
                <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-700">Sort by:</span>
                        <button
                            onClick={() => handleSort('createdAt')}
                            className={`px-3 py-1 rounded text-sm ${sortBy === 'createdAt' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
                        >
                            Date {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </button>
                        <button
                            onClick={() => handleSort('price')}
                            className={`px-3 py-1 rounded text-sm ${sortBy === 'price' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
                        >
                            Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </button>
                        <button
                            onClick={() => handleSort('sqft')}
                            className={`px-3 py-1 rounded text-sm ${sortBy === 'sqft' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
                        >
                            Size {sortBy === 'sqft' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="Min Price"
                            value={filterPrice.min}
                            onChange={(e) => setFilterPrice({ ...filterPrice, min: e.target.value })}
                            className="px-2 py-1 border rounded text-sm w-24"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                            type="number"
                            placeholder="Max Price"
                            value={filterPrice.max}
                            onChange={(e) => setFilterPrice({ ...filterPrice, max: e.target.value })}
                            className="px-2 py-1 border rounded text-sm w-24"
                        />
                    </div>
                </div>
                <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No properties match your filters</p>
                    <button
                        onClick={() => setFilterPrice({ min: '', max: '' })}
                        className="px-4 py-2 text-sm text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>
        );
    }

    if (properties.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600">No properties found</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Sort and Filter Controls */}
            <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">Sort by:</span>
                    <button
                        onClick={() => handleSort('createdAt')}
                        className={`px-3 py-1 rounded text-sm ${sortBy === 'createdAt' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
                    >
                        Date {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                    <button
                        onClick={() => handleSort('price')}
                        className={`px-3 py-1 rounded text-sm ${sortBy === 'price' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
                    >
                        Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                    <button
                        onClick={() => handleSort('sqft')}
                        className={`px-3 py-1 rounded text-sm ${sortBy === 'sqft' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700'}`}
                    >
                        Size {sortBy === 'sqft' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        placeholder="Min Price"
                        value={filterPrice.min}
                        onChange={(e) => setFilterPrice({ ...filterPrice, min: e.target.value })}
                        className="px-2 py-1 border rounded text-sm w-24"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                        type="number"
                        placeholder="Max Price"
                        value={filterPrice.max}
                        onChange={(e) => setFilterPrice({ ...filterPrice, max: e.target.value })}
                        className="px-2 py-1 border rounded text-sm w-24"
                    />
                </div>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProperties.map((property) => (
                    <div key={property._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                        {/* Property Image */}
                        <div className="relative w-full h-48 overflow-hidden">
                            <img 
                                src={getPropertyImage(property._id)} 
                                alt={property.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2 flex gap-1">
                                {user && user.role === 'admin' && (
                                    <button
                                        onClick={() => onEditProperty(property)}
                                        className="p-1 bg-[#b3d9ff] rounded-full shadow-md hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 transition-colors"
                                        title="Edit property"
                                    >
                                        ✏️
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(property._id)}
                                    className="p-1 bg-[#f9f6b0] rounded-full shadow-md hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors"
                                    title="Delete property"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                        
                        {/* Property Details */}
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">{property.title}</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                            <p><span className="font-medium">Price:</span> ₹{property.price?.toLocaleString('en-IN')}</p>
                            <p><span className="font-medium">Size:</span> {property.sqft} sqft</p>
                            <p><span className="font-medium">Bedrooms:</span> {property.bedrooms}</p>
                            <p><span className="font-medium">Bathrooms:</span> {property.bathrooms}</p>
                            <p><span className="font-medium">Location Score:</span> {property.location_score}/10</p>
                            <p><span className="font-medium">Age:</span> {property.age} years</p>
                            <p className="text-xs text-gray-500">
                                Created: {new Date(property.createdAt).toLocaleDateString()}
                            </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

