import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from './config/mongodb.js';
import authRouter from './routes/authRoutes.js';
import predictRoutes from "./routes/predictRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// Connect to MongoDB
connectDB();

// API endpoints
app.get('/', (req, res) => {
    res.send('Real Estate AI Server is running');
});

// Public routes
app.use('/api/auth', authRouter);

// Protected routes (require authentication)
app.use("/api/predict", predictRoutes);
app.use('/api/properties', propertyRoutes);

app.listen(port, () => {
    console.log(`Server started on Port: ${port}`);
})