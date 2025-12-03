import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function AdminUsersPage() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user'
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
                console.log('Users loaded:', res.data.users);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            alert(err.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'user'
        });
        setEditingUserId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editingUserId) {
                // Update user
                const res = await axios.put(`${API_BASE_URL}/admin/users/${editingUserId}`, {
                    name: formData.name,
                    email: formData.email,
                    role: formData.role
                }, {
                    withCredentials: true
                });

                if (res.data.success) {
                    alert('User updated successfully!');
                    fetchUsers();
                    resetForm();
                } else {
                    alert(res.data.message || 'Failed to update user');
                }
            }
        } catch (err) {
            console.error('Error:', err);
            alert(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (userData) => {
        setEditingUserId(userData._id);
        setFormData({
            name: userData.name,
            email: userData.email,
            password: '',
            role: userData.role
        });
        setShowForm(true);
    };

    const handleDelete = async (userId, userName) => {
        // Check if trying to delete own account
        if (user && (user.id === userId || user._id === userId)) {
            alert('You cannot delete your own account!');
            return;
        }

        if (!confirm(`Are you sure you want to delete ${userName}?`)) return;

        try {
            const res = await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, {
                withCredentials: true
            });

            if (res.data.success) {
                alert('User deleted successfully!');
                fetchUsers();
            } else {
                alert(res.data.message || 'Failed to delete user');
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert(err.response?.data?.message || 'Failed to delete user');
        }
    };

    // Navigate to user properties page
    const viewUserProperties = (userId) => {
        navigate(`/admin/users/${userId}/properties`);
    };

    const filteredUsers = users.filter(u => {
        const query = searchQuery.toLowerCase();
        return u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-600"></div>
                    <p className="mt-4 text-gray-600 text-lg">Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative bg-gradient-to-b from-cyan-50 via-blue-50 to-purple-50 py-20 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gradient mb-2">
                                👥 All Users
                            </h1>
                            <p className="text-lg text-gray-600">
                                Manage all users and view their saved properties
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="btn-premium shadow-glow-indigo"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>

                {/* User Edit Form */}
                {showForm && (
                    <div className="glass-card p-6 mb-8 shadow-premium-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Edit User
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="input-premium w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="input-premium w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="input-premium w-full"
                                    >
                                        <option value="user">👤 User</option>
                                        <option value="admin">👨‍💼 Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                >
                                    Update User
                                </button>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Search Bar */}
                <div className="mb-8">
                    <div className="glass-card p-6 shadow-premium">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or email..."
                                className="input-premium w-full"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors"
                                    title="Clear search"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        {searchQuery && (
                            <p className="text-sm text-gray-500 mt-2">
                                Found {filteredUsers.length} matching users
                            </p>
                        )}
                    </div>
                </div>

                {/* Users Table */}
                <div className="glass-card overflow-hidden shadow-premium-lg">
                    {filteredUsers.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-600 text-lg">No users found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-cyan-100 via-blue-100 to-purple-100 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Joined Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredUsers.map((u) => (
                                        <tr key={u._id} className="hover:bg-cyan-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                                                        {u.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium text-gray-900">{u.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-gray-600">{u.email}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`badge-premium ${u.role === 'admin' ? 'bg-gradient-secondary' : ''}`}>
                                                    {u.role === 'admin' ? '👨‍💼 Admin' : '👤 User'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-gray-600 text-sm">
                                                    {new Date(u.createdAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => viewUserProperties(u._id)}
                                                        className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                                        title="View user's saved properties"
                                                    >
                                                        📋 Properties
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(u)}
                                                        className="px-3 py-1.5 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                                                        title="Edit user"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(u._id, u.name)}
                                                        disabled={user && (user.id === u._id || user._id === u._id)}
                                                        className={`px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors ${user && (user.id === u._id || user._id === u._id) ? 'opacity-50 cursor-not-allowed' : ''
                                                            }`}
                                                        title="Delete user"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Stats Footer */}
                    {filteredUsers.length > 0 && (
                        <div className="bg-gradient-to-r from-cyan-100 via-blue-100 to-purple-100 border-t border-gray-200 px-6 py-4 flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                Showing <span className="font-semibold text-cyan-600">{filteredUsers.length}</span> of{' '}
                                <span className="font-semibold">{users.length}</span> users
                            </div>
                            <div className="flex gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Admins: </span>
                                    <span className="font-semibold text-purple-600">{filteredUsers.filter(u => u.role === 'admin').length}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Users: </span>
                                    <span className="font-semibold text-cyan-600">{filteredUsers.filter(u => u.role === 'user').length}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
