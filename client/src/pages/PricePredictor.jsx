import { useState } from "react";
import axios from "axios";

export default function PricePredictor() {
const [inputs, setInputs] = useState({ sqft: "", bedrooms: "", bathrooms: "", location_score: "", age: "" });
const [price, setPrice] = useState(null);

const handleChange = (e) => setInputs({ ...inputs, [e.target.name]: e.target.value });

const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post("/api/predict/price", inputs);
    setPrice(res.data.predicted_price);
};

return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
    <h2 className="text-xl font-semibold mb-4">🏠 Predict Property Price</h2>
    <form onSubmit={handleSubmit} className="space-y-3">
        {Object.keys(inputs).map((key) => (
        <input key={key} name={key} value={inputs[key]} onChange={handleChange}
            placeholder={key.replace("_", " ")} className="border rounded p-2 w-full" />
        ))}
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Predict</button>
    </form>
    {price && <p className="mt-4 text-lg font-bold">💰 Predicted Price: ₹{price.toLocaleString()}</p>}
    </div>
);
}


