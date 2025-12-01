import { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

export default function EditPropertyModal({ isOpen, onClose, onSuccess, property }) {
    const [formData, setFormData] = useState({
        title: '',
        sqft: '',
        bedrooms: '',
        bathrooms: '',
        location_score: '',
        age: '',
        price: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Populate form when property changes
    useEffect(() => {
        if (property) {
            setFormData({
                title: property.title || '',
                sqft: property.sqft || '',
                bedrooms: property.bedrooms || '',
                bathrooms: property.bathrooms || '',
                location_score: property.location_score || '',
                age: property.age || '',
                price: property.price || ''
            });
        }
    }, [property]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.title || !formData.sqft || !formData.bedrooms || 
            formData.bathrooms === '' || !formData.location_score || 
            formData.age === '' || !formData.price) {
            setError('Please fill in all fields');
            return;
        }

        if (formData.location_score < 1 || formData.location_score > 10) {
            setError('Location score must be between 1 and 10');
            return;
        }

        try {
            setLoading(true);
            const res = await axios.put(`${API_BASE_URL}/properties/${property._id}`, {
                title: formData.title,
                sqft: parseFloat(formData.sqft),
                bedrooms: parseInt(formData.bedrooms),
                bathrooms: parseInt(formData.bathrooms),
                location_score: parseFloat(formData.location_score),
                age: parseInt(formData.age),
                price: parseFloat(formData.price)
            }, {
                withCredentials: true
            });

            if (res.data.success) {
                onSuccess();
                onClose();
            } else {
                setError(res.data.message || 'Failed to update property');
            }
        } catch (err) {
            console.error('Error updating property:', err);
            setError(err.response?.data?.message || 'Failed to update property');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-2xl font-bold text-gray-900">✏️ Edit Property</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold transition-colors"
                    >
                        ×
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Property Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g., My Dream Home"
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Square Feet <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="sqft"
                                    value={formData.sqft}
                                    onChange={handleChange}
                                    placeholder="1200"
                                    min="1"
                                    step="0.01"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price (₹) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    placeholder="5000000"
                                    min="0"
                                    step="0.01"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bedrooms <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="bedrooms"
                                    value={formData.bedrooms}
                                    onChange={handleChange}
                                    placeholder="2"
                                    min="0"
                                    max="20"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bathrooms <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="bathrooms"
                                    value={formData.bathrooms}
                                    onChange={handleChange}
                                    placeholder="2"
                                    min="0"
                                    max="20"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Age (Years) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    placeholder="0"
                                    min="0"
                                    max="100"
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Location Score (1-10) <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    name="location_score"
                                    value={formData.location_score}
                                    onChange={handleChange}
                                    min="1"
                                    max="10"
                                    step="0.5"
                                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="text-lg font-semibold text-indigo-600 min-w-[40px]">
                                    {formData.location_score}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 mt-8">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors font-semibold"
                        >
                            {loading ? 'Updating...' : 'Update Property'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
