import { useState, useContext } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";
import { AuthContext } from "../context/AuthContext";

export default function PricePredictor({ onPropertySaved }) {
const { user, token } = useContext(AuthContext);
const [inputs, setInputs] = useState({ 
    sqft: "", 
    bedrooms: "", 
    bathrooms: "", 
    location_score: "", 
    age: "",
    title: ""
});
const [price, setPrice] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [saveError, setSaveError] = useState(null);
const [saveProperty, setSaveProperty] = useState(false);
const [savedProperty, setSavedProperty] = useState(null);

const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
    setError(null);
    setSaveError(null);
};

const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check authentication
    if (!user && !token) {
        setError("Please login to make predictions");
        return;
    }
    
    setLoading(true);
    setError(null);
    setSaveError(null);
    setPrice(null);
    setSavedProperty(null);
    
    try {
        // Convert string inputs to numbers
        const payload = {
            sqft: parseFloat(inputs.sqft),
            bedrooms: parseInt(inputs.bedrooms),
            bathrooms: parseInt(inputs.bathrooms),
            location_score: parseFloat(inputs.location_score),
            age: parseInt(inputs.age)
        };
        
        // Validate inputs
        if (Object.values(payload).some(val => isNaN(val))) {
            throw new Error("Please enter valid numbers for all fields");
        }
        
        if (payload.sqft <= 0) {
            throw new Error("Square feet must be greater than 0");
        }
        
        if (payload.bedrooms < 0 || payload.bathrooms < 0 || payload.age < 0) {
            throw new Error("Bedrooms, bathrooms, and age must be non-negative");
        }
        
        if (payload.location_score < 1 || payload.location_score > 10) {
            throw new Error("Location score must be between 1 and 10");
        }
        
        // Add save flag and title if user wants to save
        if (saveProperty) {
            payload.save = true;
            if (inputs.title.trim()) {
                payload.title = inputs.title.trim();
            }
            // Note: Server will validate that title is required when save is true
        }
        
        // Make request with credentials
        const res = await axios.post(`${API_BASE_URL}/predict/price`, payload, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (res.data.success) {
            setPrice(res.data.predicted_price);
            if (res.data.property) {
                setSavedProperty(res.data.property);
                setSaveError(null);
                console.log("✅ Property saved:", res.data.property);
                // Notify parent component to refresh properties list
                if (onPropertySaved) {
                    onPropertySaved();
                }
            } else if (res.data.saveError) {
                // Show save error separately (prediction was successful)
                console.error("❌ Save error:", res.data.saveError);
                setSaveError(res.data.saveError);
            } else if (saveProperty && res.data.saved === false) {
                // User wanted to save but it didn't save (no error message means title might be missing)
                setSaveError("Property was not saved. Please make sure title is filled.");
                console.log("ℹ️ Property was not saved");
            }
        } else {
            setError(res.data.error || "Failed to predict price");
        }
    } catch (err) {
        console.error("Prediction error:", err);
        
        // Handle different error types
        if (err.response) {
            // Server responded with error
            if (err.response.status === 401) {
                setError("Please login to make predictions");
            } else if (err.response.status === 503) {
                setError("AI prediction service is unavailable. Please try again later.");
            } else {
                setError(err.response.data?.error || err.response.data?.detail || err.response.data?.message || "Failed to predict price");
            }
        } else if (err.request) {
            // Request made but no response
            setError("Unable to connect to server. Please check if the server is running.");
        } else {
            // Error in request setup
            setError(err.message || "Failed to predict price");
        }
    } finally {
        setLoading(false);
    }
};

return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
    <h2 className="text-xl font-semibold mb-4">🏠 Predict Property Price</h2>
    
    {!user && !token && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
            ⚠️ Please login to make predictions
        </div>
    )}
    
    <form onSubmit={handleSubmit} className="space-y-3">
        <input 
            type="number" 
            name="sqft" 
            value={inputs.sqft} 
            onChange={handleChange}
            placeholder="Square Feet" 
            className="border rounded p-2 w-full" 
            required 
            min="1"
            step="0.01"
        />
        <input 
            type="number" 
            name="bedrooms" 
            value={inputs.bedrooms} 
            onChange={handleChange}
            placeholder="Bedrooms" 
            className="border rounded p-2 w-full" 
            required 
            min="0"
        />
        <input 
            type="number" 
            name="bathrooms" 
            value={inputs.bathrooms} 
            onChange={handleChange}
            placeholder="Bathrooms" 
            className="border rounded p-2 w-full" 
            required 
            min="0"
        />
        <input 
            type="number" 
            name="location_score" 
            value={inputs.location_score} 
            onChange={handleChange}
            placeholder="Location Score (1-10)" 
            className="border rounded p-2 w-full" 
            required 
            min="1" 
            max="10"
            step="0.1"
        />
        <input 
            type="number" 
            name="age" 
            value={inputs.age} 
            onChange={handleChange}
            placeholder="Property Age (years)" 
            className="border rounded p-2 w-full" 
            required 
            min="0"
        />
        
        {/* Save property option */}
        <div className="flex items-center space-x-2">
            <input 
                type="checkbox" 
                id="saveProperty"
                checked={saveProperty}
                onChange={(e) => setSaveProperty(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="saveProperty" className="text-sm text-gray-700">
                Save this prediction to my properties
            </label>
        </div>
        
        {saveProperty && (
            <input 
                type="text" 
                name="title" 
                value={inputs.title} 
                onChange={handleChange}
                placeholder="Property Title (required to save)" 
                className="border rounded p-2 w-full" 
                required={saveProperty}
            />
        )}
        
        <button 
            type="submit"
            disabled={loading || (!user && !token)}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
            {loading ? "Predicting..." : "Predict Price"}
        </button>
    </form>
    
    {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-600">
            ❌ {error}
        </div>
    )}
    
    {price && (
        <div className="mt-4 space-y-2">
            <div className="p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-lg font-bold text-green-800">
                    💰 Predicted Price: ₹{price.toLocaleString('en-IN')}
                </p>
            </div>
            {savedProperty && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-700">
                    ✅ Property saved successfully! 
                    <span className="text-xs block mt-1">ID: {savedProperty.id}</span>
                </div>
            )}
            {saveError && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded text-orange-700">
                    ⚠️ Save Error: {saveError}
                </div>
            )}
            {saveProperty && !savedProperty && !saveError && price && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700">
                    ℹ️ Property was not saved. Please fill in the title field above.
                </div>
            )}
        </div>
    )}
    </div>
);
}


