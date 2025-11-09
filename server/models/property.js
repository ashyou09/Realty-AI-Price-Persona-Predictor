import mongoose from 'mongoose';


    title: { type: String, required: true },
    sqft: { type: Number, required: true },
    bedrooms: { type: Number, required: true },
    price: { type: Number, required: true },
    persona: { type: String, default: null },
    persona_cluster: { type: Number, default: null },
    model_version: { type: String, default: null },
    ownerId: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
});

// Prevent model overwrite issues in serverless / hot-reload environments
export default mongoose.models.Property || mongoose.model('Property', propertySchema);
