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

// CORS configuration - Allow both localhost (development) and production domains
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://realstate-ml-model.vercel.app',
  process.env.Frontend_URL
].filter(Boolean); // Remove undefined values

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

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