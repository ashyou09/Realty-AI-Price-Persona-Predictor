import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userProperties, setUserProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showPropertyForm, setShowPropertyForm] = useState(false);
    const [editingProperty, setEditingProperty] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        sqft: '',
        bedrooms: '',
        bathrooms: '',
        location_score: '',
        age: ''
    });

    // Check if user is admin
    useEffect(() => {
        if (user && user.role !== 'admin') {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    // Fetch all users
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/auth/users`, {
                withCredentials: true
            });
            if (res.data.success && res.data.users) {
                setUsers(res.data.users);
                setError(null);
            } else {
                setError('Failed to fetch users');
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.response?.data?.message || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    // Fetch user properties when user is selected
    const selectUser = async (selectedUser) => {
        setSelectedUser(selectedUser);
        setUserProperties([]);
        setEditingProperty(null);
        setShowPropertyForm(false);
        try {
            const res = await axios.get(`${API_BASE_URL}/properties?userId=${selectedUser.id}`, {
                withCredentials: true
            });
            if (res.data.success && res.data.properties) {
                setUserProperties(res.data.properties);
            }
        } catch (err) {
            console.error('Error fetching properties:', err);
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            sqft: '',
            bedrooms: '',
            bathrooms: '',
            location_score: '',
            age: ''
        });
        setEditingProperty(null);
        setShowPropertyForm(false);
    };

    // Create property
    const createProperty = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_BASE_URL}/properties`, {
                ...formData,
                sqft: parseFloat(formData.sqft),
                bedrooms: parseInt(formData.bedrooms),
                bathrooms: parseInt(formData.bathrooms),
                location_score: parseFloat(formData.location_score),
                age: parseInt(formData.age)
            }, {
                withCredentials: true
            });
            
            if (res.data.success) {
                alert('Property created successfully!');
                selectUser(selectedUser); // Refresh properties
                resetForm();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create property');
        }
    };

    // Update property
    const updateProperty = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`${API_BASE_URL}/properties/${editingProperty._id}`, {
                ...formData,
                sqft: parseFloat(formData.sqft),
                bedrooms: parseInt(formData.bedrooms),
                bathrooms: parseInt(formData.bathrooms),
                location_score: parseFloat(formData.location_score),
                age: parseInt(formData.age)
            }, {
                withCredentials: true
            });
            
            if (res.data.success) {
                alert('Property updated successfully!');
                selectUser(selectedUser); // Refresh properties
                resetForm();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update property');
        }
    };

    // Delete property
    const deleteProperty = async (propertyId) => {
        if (!confirm('Are you sure you want to delete this property?')) return;
        
        try {
            const res = await axios.delete(`${API_BASE_URL}/properties/${propertyId}`, {
                withCredentials: true
            });
            
            if (res.data.success) {
                alert('Property deleted successfully!');
                selectUser(selectedUser); // Refresh properties
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete property');
        }
    };

    // Edit property
    const editProperty = (property) => {
        setEditingProperty(property);
        setFormData({
            title: property.title,
            sqft: property.sqft,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            location_score: property.location_score,
            age: property.age
        });
        setShowPropertyForm(true);
    };

    // Filter users
    const filteredUsers = users.filter(u => {
        const query = searchQuery.toLowerCase();
        return u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600">Manage users and their properties</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Users List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Users ({filteredUsers.length})</h2>
                            
                            {/* Search */}
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />

                            {/* Users List */}
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {filteredUsers.map(u => (
                                    <button
                                        key={u.id}
                                        onClick={() => selectUser(u)}
                                        className={`w-full text-left p-3 rounded-lg transition-all ${
                                            selectedUser?.id === u.id
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                        }`}
                                    >
                                        <div className="font-medium">{u.name}</div>
                                        <div className="text-sm opacity-75">{u.email}</div>
                                        <div className="text-xs mt-1">
                                            {u.role === 'admin' ? '👨‍💼 Admin' : '👤 User'}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Properties Panel */}
                    <div className="lg:col-span-2">
                        {selectedUser ? (
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedUser.name}'s Properties</h2>
                                    <p className="text-gray-600 text-sm mb-4">{selectedUser.email}</p>
                                    <button
                                        onClick={() => {
                                            setShowPropertyForm(!showPropertyForm);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        {showPropertyForm ? 'Cancel' : '+ Add Property'}
                                    </button>
                                </div>

                                {/* Property Form */}
                                {showPropertyForm && (
                                    <form onSubmit={editingProperty ? updateProperty : createProperty} className="bg-gray-50 p-4 rounded-lg mb-6 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                type="text"
                                                name="title"
                                                placeholder="Property Title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                required
                                                className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            />
                                            <input
                                                type="number"
                                                name="sqft"
                                                placeholder="Square Feet"
                                                value={formData.sqft}
                                                onChange={handleInputChange}
                                                required
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            />
                                            <input
                                                type="number"
                                                name="bedrooms"
                                                placeholder="Bedrooms"
                                                value={formData.bedrooms}
                                                onChange={handleInputChange}
                                                required
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            />
                                            <input
                                                type="number"
                                                name="bathrooms"
                                                placeholder="Bathrooms"
                                                value={formData.bathrooms}
                                                onChange={handleInputChange}
                                                required
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            />
                                            <input
                                                type="number"
                                                step="0.1"
                                                name="location_score"
                                                placeholder="Location Score (1-10)"
                                                value={formData.location_score}
                                                onChange={handleInputChange}
                                                required
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            />
                                            <input
                                                type="number"
                                                name="age"
                                                placeholder="Age (years)"
                                                value={formData.age}
                                                onChange={handleInputChange}
                                                required
                                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            {editingProperty ? 'Update Property' : 'Create Property'}
                                        </button>
                                    </form>
                                )}

                                {/* Properties List */}
                                <div className="space-y-4">
                                    {userProperties.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">No properties found</p>
                                    ) : (
                                        userProperties.map(prop => (
                                            <div key={prop._id} className="bg-gray-50 p-4 rounded-lg">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="font-bold text-gray-900">{prop.title}</h3>
                                                        <p className="text-sm text-gray-600">{prop.sqft} sqft • {prop.bedrooms} BD • {prop.bathrooms} BA</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => editProperty(prop)}
                                                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => deleteProperty(prop._id)}
                                                            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500">Score: {prop.location_score} | Age: {prop.age} years</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow p-12 text-center">
                                <p className="text-gray-500">Select a user to view their properties</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
