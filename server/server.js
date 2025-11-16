import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import predictRoutes from "./routes/predictRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import housingRoutes from "./routes/housingRoutes.js";

const app = express();
const port = process.env.Port;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.Frontend_URL , credentials: true }));

// Connect to MongoDB
connectDB();

// API endpoints
app.get('/', (req, res) => {
    res.send('Real Estate AI Server is running');
});

// Public routes
app.use('/api/auth', authRouter);
app.use('/api/housing', housingRoutes); // Public housing data

// Protected routes (require authentication)
app.use("/api/predict", predictRoutes);
app.use('/api/properties', propertyRoutes);

app.listen(port, () => {
    console.log(`Server started on Port: ${port}`);
})