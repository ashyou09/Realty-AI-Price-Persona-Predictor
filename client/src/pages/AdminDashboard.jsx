import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserForm, setShowUserForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
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
            const res = await axios.get(`${API_BASE_URL}/admin/users`, {
                withCredentials: true
            });
            if (res.data.success && res.data.users) {
                setUsers(res.data.users);
                console.log('Users loaded:', res.data.users);
            } else {
                console.error('Failed to fetch users');
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            alert(err.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
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
            name: '',
            email: '',
            password: '',
            role: 'user'
        });
        setEditingUser(null);
        setShowUserForm(false);
    };

    // Create user
    const createUser = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_BASE_URL}/admin/users`, {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role
            }, {
                withCredentials: true
            });

            if (res.data.success) {
                alert('User created successfully!');
                fetchUsers();
                resetForm();
            } else {
                alert(res.data.message || 'Failed to create user');
            }
        } catch (err) {
            console.error('Create user error:', err);
            alert(err.response?.data?.message || 'Failed to create user');
        }
    };

    // Update user
    const updateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put(`${API_BASE_URL}/admin/users/${editingUser._id}`, {
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
        } catch (err) {
            console.error('Update user error:', err);
            alert(err.response?.data?.message || 'Failed to update user');
        }
    };

    // Delete user
    const deleteUser = async (userId, userName) => {
        // Prevent admin from deleting themselves
        if (user && user.id === userId) {
            alert('You cannot delete your own admin account!');
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
            }
        } catch (err) {
            console.error('Delete user error:', err);
            alert(err.response?.data?.message || 'Failed to delete user');
        }
    };

    // Update user role
    const updateUserRole = async (userId, newRole) => {
        // Prevent admin from changing their own role
        if (user && user.id === userId && newRole !== 'admin') {
            alert('You cannot remove your own admin privileges!');
            return;
        }

        try {
            const res = await axios.patch(`${API_BASE_URL}/admin/users/${userId}/role`, {
                role: newRole
            }, {
                withCredentials: true
            });

            if (res.data.success) {
                alert('User role updated successfully!');
                fetchUsers();
            }
        } catch (err) {
            console.error('Update role error:', err);
            alert(err.response?.data?.message || 'Failed to update user role');
        }
    };

    // Edit user
    const editUserHandler = (u) => {
        setEditingUser(u);
        setFormData({
            name: u.name,
            email: u.email,
            password: '',
            role: u.role
        });
        setShowUserForm(true);
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
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">👨‍💼 Admin Dashboard</h1>
                        <p className="text-gray-600">Manage all users in the system</p>
                    </div>
                    <button
                        onClick={() => {
                            setShowUserForm(!showUserForm);
                            setEditingUser(null);
                            resetForm();
                        }}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        + Add New User
                    </button>
                </div>

                {/* User Form */}
                {showUserForm && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            {editingUser ? 'Edit User' : 'Create New User'}
                        </h2>
                        <form onSubmit={editingUser ? updateUser : createUser} className="space-y-4">
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                    />
                                </div>
                                {!editingUser && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                        <input
                                            type="password"
                                            name="password"
                                            placeholder="Password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required={!editingUser}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                                    {editingUser ? 'Update User' : 'Create User'}
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

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Search Bar */}
                    <div className="p-6 border-b border-gray-200">
                        <input
                            type="text"
                            placeholder="🔍 Search by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>

                    {/* Users List */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Joined</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map(u => (
                                        <tr key={u._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{u.name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-gray-600">{u.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => updateUserRole(u._id, e.target.value)}
                                                    disabled={user && user.id === u._id}
                                                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                        u.role === 'admin'
                                                            ? 'bg-purple-100 text-purple-800'
                                                            : 'bg-blue-100 text-blue-800'
                                                    } ${user && user.id === u._id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                >
                                                    <option value="user">👤 User</option>
                                                    <option value="admin">👨‍💼 Admin</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600">
                                                    {new Date(u.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => editUserHandler(u)}
                                                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteUser(u._id, u.name)}
                                                        disabled={user && user.id === u._id}
                                                        className={`px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors ${
                                                            user && user.id === u._id ? 'opacity-50 cursor-not-allowed' : ''
                                                        }`}
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Total Users: <span className="font-bold text-gray-900">{users.length}</span> | 
                            Showing: <span className="font-bold text-gray-900">{filteredUsers.length}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
