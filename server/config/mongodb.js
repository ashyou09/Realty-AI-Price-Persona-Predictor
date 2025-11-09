import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log('✅ Database Connected');
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️  MongoDB disconnected');
        });

        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
        await mongoose.connect(`${mongoUri}/real_state`);
        console.log('🔗 Connecting to MongoDB...');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

export default connectDB;