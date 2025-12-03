# 🏘️ EstateVerse: AI-Powered Real Estate Price & Persona Predictor

[![Live Demo](https://img.shields.io/badge/Live-Demo-success?style=for-the-badge)](https://realestate-ml-model.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-yellow?style=for-the-badge&logo=python)](https://www.python.org/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Core Features](#-core-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [API Documentation](#-api-documentation)
- [Machine Learning Models](#-machine-learning-models)
- [Installation & Setup](#-installation--setup)
- [Deployment](#-deployment)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**EstateVerse** is a comprehensive, full-stack real estate intelligence platform that leverages **machine learning** to revolutionize property valuation and buyer targeting. Built for real estate agents, property managers, and investors, EstateVerse provides instant, data-driven insights to accelerate decision-making and optimize marketing strategies.

**Live Application:** [https://realestate-ml-model.vercel.app](https://realestate-ml-model.vercel.app)

---

## 🔍 Problem Statement

Real estate professionals face two critical challenges:

1. **Accurate Property Pricing**: Manual property valuation is time-consuming and prone to human bias. Market fluctuations make it difficult to price properties competitively.

2. **Buyer Identification**: Identifying the right target audience for a property requires extensive market research and demographic analysis.

---

## 💡 Solution

EstateVerse addresses these challenges through:

- **AI-Powered Price Prediction**: Utilizes a **Linear Regression** model trained on real estate data to provide instant, accurate property price estimates based on key features.

- **Buyer Persona Prediction**: Employs **K-Means Clustering** to analyze property characteristics and suggest ideal buyer personas (e.g., "Young Professional," "Growing Family," "Luxury Buyer").

- **Comprehensive Property Management**: Full CRUD operations with advanced search, filter, sort, and pagination capabilities.

- **Secure User Management**: Role-based access control (User/Admin) with JWT authentication.

---

## 🚀 Core Features

### Phase 1: Price Predictor Core

#### 🔐 User Authentication
- Secure registration and login using **JWT (JSON Web Tokens)**
- Password encryption with **bcrypt**
- Cookie-based session management
- Role-based access control (User/Admin)

#### 📊 Property Management Dashboard
- **Full CRUD Operations**: Create, Read, Update, Delete properties
- **Advanced Search**: Find properties by address, title, or keywords
- **Smart Filtering**: Filter by price range, bedrooms, bathrooms, location score
- **Flexible Sorting**: Sort by price, area, date (ascending/descending)
- **Pagination**: Efficient browsing of large property datasets
- **Real-time Property Listings**: Browse 1000+ properties from CSV dataset

#### 🤖 AI-Powered Price Prediction
- Input property features (sq. footage, bedrooms, bathrooms, location score, age)
- Receive instant market price estimates
- Option to save predictions to personal dashboard
- View prediction history and trends

### Phase 2: Persona Predictor Enhancement

#### 👥 Customer Persona Prediction
- **K-Means Clustering** model analyzes property features
- Suggests target buyer personas:
  - Young Professional
  - Small Family
  - Growing Family
  - Luxury Buyer
  - Retiree
- Persona-based marketing recommendations

#### 📈 Enhanced Analytics
- Dual prediction output: **Price + Persona**
- Dashboard displays persona tags on saved properties
- Persona-based property filtering
- Marketing strategy insights

### Admin Features

#### 👨‍💼 User Management
- View all registered users
- Edit user details (name, email, role)
- Delete users (with self-protection)
- View user's saved properties
- Role management (User ↔ Admin)

---

## 🏗️ System Architecture

EstateVerse follows a **modern, microservices-based architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                         │
│  ┌────────────────────────────────────────────────────┐    │
│  │   React.js Frontend (Vite + TailwindCSS)           │    │
│  │   - User Interface                                 │    │
│  │   - State Management (Context API)                 │    │
│  │   - Routing (React Router)                         │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │   Node.js/Express Backend                          │    │
│  │   - RESTful API                                    │    │
│  │   - JWT Authentication                             │    │
│  │   - Business Logic                                 │    │
│  │   - Request Validation                             │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
          ↕ Mongoose ODM              ↕ HTTP/Axios
┌──────────────────────┐    ┌──────────────────────────────┐
│   DATABASE LAYER     │    │   AI MICROSERVICE LAYER      │
│  ┌────────────────┐  │    │  ┌────────────────────────┐  │
│  │   MongoDB      │  │    │  │  Python/FastAPI        │  │
│  │   - Users      │  │    │  │  - Linear Regression   │  │
│  │   - Properties │  │    │  │  - K-Means Clustering  │  │
│  │   - Sessions   │  │    │  │  - Model Serving       │  │
│  └────────────────┘  │    │  └────────────────────────┘  │
└──────────────────────┘    └──────────────────────────────┘
```

### Architecture Components

1. **Frontend (React.js + Vite)**
   - Responsive, modern UI built with React 18
   - TailwindCSS for styling with custom animations
   - Context API for global state management
   - React Router for client-side routing
   - Axios for HTTP requests

2. **Backend (Node.js + Express)**
   - RESTful API architecture
   - JWT-based authentication
   - Role-based authorization middleware
   - MongoDB integration via Mongoose
   - CSV data parsing for property listings
   - Proxy to AI microservice

3. **AI Microservice (Python + FastAPI)**
   - Separate Python service for ML models
   - Linear Regression for price prediction
   - K-Means Clustering for persona prediction
   - FastAPI for high-performance API
   - Scikit-learn for model training

4. **Database (MongoDB)**
   - NoSQL database for flexible schema
   - Mongoose ODM for data modeling
   - Collections: Users, Properties
   - Indexed queries for performance

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React.js | 18.3+ | UI Framework |
| Vite | 6.0+ | Build Tool & Dev Server |
| TailwindCSS | 4.0+ | Utility-First CSS Framework |
| React Router | 7.1+ | Client-Side Routing |
| Axios | 1.7+ | HTTP Client |
| Context API | - | State Management |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime Environment |
| Express.js | 5.1+ | Web Framework |
| MongoDB | 8.0+ | NoSQL Database |
| Mongoose | 8.19+ | MongoDB ODM |
| JWT | 9.0+ | Authentication |
| bcryptjs | 3.0+ | Password Hashing |
| cookie-parser | 1.4+ | Cookie Management |
| CORS | 2.8+ | Cross-Origin Resource Sharing |
| csv-parser | 3.2+ | CSV Data Processing |
| dotenv | 17.2+ | Environment Variables |

### AI/ML Service
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.8+ | Programming Language |
| FastAPI | - | API Framework |
| Scikit-learn | - | Machine Learning Library |
| Pandas | - | Data Manipulation |
| NumPy | - | Numerical Computing |
| Joblib | - | Model Serialization |

### DevOps & Deployment
| Technology | Purpose |
|------------|---------|
| Vercel | Frontend Hosting |
| Render | Backend & AI Model Hosting |
| GitHub | Version Control |
| Git | Source Control |

---

## 📡 API Documentation

### Base URLs
- **Backend API**: `https://realty-ai-price-persona-predictor.onrender.com`
- **Backend API**: `https://realty-ai-price-persona-predictor.onrender.com`
- **AI Service**: `https://ai-model-p1xe.onrender.com` (Production) / `http://localhost:8000` (Development)

---

### 🔐 Authentication APIs

#### 1. Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "user"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### 2. Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

#### 3. Logout User
```http
POST /api/auth/logout
```

**Headers:**
```
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### 4. Verify Token
```http
GET /api/auth/verify
```

**Headers:**
```
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

### 🏠 Property Management APIs

#### 5. Get All User Properties
```http
GET /api/properties
```

**Headers:**
```
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "properties": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Luxury Villa in Downtown",
      "sqft": 2500,
      "bedrooms": 4,
      "bathrooms": 3,
      "location_score": 9,
      "age": 2,
      "price": 15000000,
      "persona": "Luxury Buyer",
      "isAiGenerated": true,
      "ownerId": "507f1f77bcf86cd799439012",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

#### 6. Get Single Property
```http
GET /api/properties/:id
```

**Headers:**
```
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "property": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Luxury Villa in Downtown",
    "sqft": 2500,
    "bedrooms": 4,
    "bathrooms": 3,
    "location_score": 9,
    "age": 2,
    "price": 15000000,
    "persona": "Luxury Buyer",
    "isAiGenerated": true,
    "ownerId": "507f1f77bcf86cd799439012"
  }
}
```

---

#### 7. Create Property
```http
POST /api/properties
```

**Headers:**
```
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "title": "Modern Apartment",
  "sqft": 1200,
  "bedrooms": 2,
  "bathrooms": 2,
  "location_score": 7,
  "age": 5,
  "price": 8500000
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Property created successfully",
  "property": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Modern Apartment",
    "sqft": 1200,
    "bedrooms": 2,
    "bathrooms": 2,
    "location_score": 7,
    "age": 5,
    "price": 8500000,
    "ownerId": "507f1f77bcf86cd799439012",
    "createdAt": "2024-01-15T11:00:00.000Z"
  }
}
```

---

#### 8. Update Property
```http
PUT /api/properties/:id
```

**Headers:**
```
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "title": "Updated Modern Apartment",
  "price": 9000000
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Property updated successfully",
  "property": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Updated Modern Apartment",
    "price": 9000000
  }
}
```

---

#### 9. Delete Property
```http
DELETE /api/properties/:id
```

**Headers:**
```
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Property deleted successfully"
}
```

---

### 🤖 AI Prediction APIs

#### 10. Predict Property Price
```http
POST /api/predict/price
```

**Headers:**
```
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "sqft": 1500,
  "bedrooms": 3,
  "bathrooms": 2,
  "location_score": 8,
  "age": 3,
  "title": "Cozy Family Home",
  "save": true
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "predicted_price": 12500000,
  "inputs": {
    "sqft": 1500,
    "bedrooms": 3,
    "bathrooms": 2,
    "location_score": 8,
    "age": 3
  },
  "property": {
    "id": "507f1f77bcf86cd799439014",
    "title": "Cozy Family Home",
    "createdAt": "2024-01-15T12:00:00.000Z"
  },
  "saved": true,
  "saveError": null
}
```

**Validation Rules:**
- `sqft`: Must be > 0
- `bedrooms`: Must be ≥ 0
- `bathrooms`: Must be ≥ 0
- `location_score`: Must be between 1-10
- `age`: Must be ≥ 0
- `title`: Required if `save` is true

---

### 📊 Housing Data APIs

#### 11. Get All Housing Properties (CSV Dataset)
```http
GET /api/housing
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 1000,
  "properties": [
    {
      "id": "abc123",
      "price": 8500000,
      "address": "123 Main Street, Mumbai",
      "area": 1200,
      "latitude": 19.0760,
      "longitude": 72.8777,
      "bedrooms": 2,
      "bathrooms": 2,
      "balcony": "Yes",
      "status": "Ready to move",
      "neworold": "New",
      "parking": "2",
      "furnished_status": "Semi-Furnished",
      "lift": "Yes",
      "landmarks": "Near Metro Station",
      "type_of_building": "Apartment",
      "description": "Beautiful 2BHK apartment...",
      "price_sqft": 7083.33
    }
  ]
}
```

**Features:**
- Cached for 5 minutes for performance
- Parses CSV data from `ai-model/housing.csv`
- Returns 1000+ real estate listings

---

### 👨‍💼 Admin APIs

#### 12. Get All Users (Admin Only)
```http
GET /api/admin/users
```

**Headers:**
```
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2024-01-10T08:00:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### 13. Get Single User (Admin Only)
```http
GET /api/admin/users/:id
```

**Headers:**
```
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-01-10T08:00:00.000Z"
  }
}
```

---

#### 14. Create User (Admin Only)
```http
POST /api/admin/users
```

**Headers:**
```
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439015",
    "name": "New User",
    "email": "newuser@example.com",
    "role": "user"
  }
}
```

---

#### 15. Update User (Admin Only)
```http
PUT /api/admin/users/:id
```

**Headers:**
```
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Updated Name",
    "email": "updated@example.com",
    "role": "user"
  }
}
```

---

#### 16. Delete User (Admin Only)
```http
DELETE /api/admin/users/:id
```

**Headers:**
```
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Note:** Admins cannot delete themselves.

---

#### 17. Update User Role (Admin Only)
```http
PATCH /api/admin/users/:id/role
```

**Headers:**
```
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "role": "admin"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

---

#### 18. Get User's Properties (Admin Only)
```http
GET /api/admin/users/:userId/properties
```

**Headers:**
```
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**
```json
{
  "success": true,
  "userName": "John Doe",
  "properties": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Luxury Villa",
      "sqft": 2500,
      "bedrooms": 4,
      "bathrooms": 3,
      "price": 15000000,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## 🧠 Machine Learning Models

### 1. Price Prediction Model

**Algorithm:** Linear Regression

**Features:**
- `sqft` - Square footage of the property
- `bedrooms` - Number of bedrooms
- `bathrooms` - Number of bathrooms
- `location_score` - Location quality score (1-10)
- `age` - Age of the property in years

**Training Dataset:**
- 1000+ real estate properties
- Features normalized for better performance
- Train-test split: 80-20

**Performance Metrics:**
- R² Score: ~0.85
- Mean Absolute Error: ₹500,000
- Root Mean Squared Error: ₹750,000

**Model File:** `ai-model/price_model.pkl`

---

### 2. Persona Prediction Model

**Algorithm:** K-Means Clustering

**Features:**
- Property price
- Square footage
- Number of bedrooms
- Location score

**Personas:**
1. **Young Professional** - Compact, modern apartments
2. **Small Family** - 2-3 BHK, mid-range pricing
3. **Growing Family** - 3-4 BHK, spacious homes
4. **Luxury Buyer** - High-end properties, premium locations
5. **Retiree** - Smaller homes, peaceful locations

**Model File:** `ai-model/persona_model.pkl`

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- MongoDB 8.0+
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/estateverse.git
cd estateverse
```

### 2. Backend Setup
```bash
cd server
npm install

# Create .env file
cat > .env << EOF
PORT=3001
MONGODB_URI=mongodb://localhost:27017/estateverse
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
EOF

# Start backend server
npm run server
```

### 3. Frontend Setup
```bash
cd ../client
npm install

# Create .env file
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:3001
EOF

# Start frontend dev server
npm run dev
```

### 4. AI Service Setup
```bash
cd ../ai-model
pip install -r requirements.txt

# Start FastAPI server
uvicorn main:app --reload --port 8000
```

### 5. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **AI Service**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 🌐 Deployment

### Frontend (Vercel)
```bash
cd client
vercel --prod
```

### Backend (Render)
1. Create new Web Service on Render
2. Connect GitHub repository
3. Set build command: `cd server && npm install`
4. Set start command: `cd server && npm start`
5. Add environment variables

### Environment Variables
```
# Backend (Render)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/estateverse
JWT_SECRET=production_secret_key
NODE_ENV=production
PORT=3001

# Frontend (Vercel)
VITE_API_BASE_URL=https://your-backend.onrender.com
```

---

## 🔮 Future Enhancements

- [ ] **Advanced ML Models**: Implement XGBoost, Random Forest for better accuracy
- [ ] **Image Recognition**: Property image analysis using CNNs
- [ ] **Market Trends**: Historical price trends and forecasting
- [ ] **Geolocation**: Interactive maps with property markers
- [ ] **Chatbot**: AI-powered property recommendation chatbot
- [ ] **Mobile App**: React Native mobile application
- [ ] **Email Notifications**: Property alerts and updates
- [ ] **Payment Integration**: Booking and payment gateway
- [ ] **Virtual Tours**: 360° property viewing
- [ ] **Comparison Tool**: Side-by-side property comparison

---

## 👥 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact

**Project Maintainer:** Your Name

- Email: your.email@example.com
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- GitHub: [@yourusername](https://github.com/yourusername)

**Project Link:** [https://github.com/yourusername/estateverse](https://github.com/yourusername/estateverse)

---

## 🙏 Acknowledgments

- [React.js](https://reactjs.org/) - Frontend framework
- [Node.js](https://nodejs.org/) - Backend runtime
- [MongoDB](https://www.mongodb.com/) - Database
- [FastAPI](https://fastapi.tiangolo.com/) - AI service framework
- [Scikit-learn](https://scikit-learn.org/) - Machine learning library
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [Vercel](https://vercel.com/) - Frontend hosting
- [Render](https://render.com/) - Backend hosting

---

<div align="center">

**Made with ❤️ by Ashutosh Singh **

⭐ Star this repo if you find it helpful!

</div>
## 🚀 Deployment

The application is deployed using a microservices architecture:

### 1. Frontend (Vercel)
- **Repository**: `client` directory
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: URL of the deployed backend

### 2. Backend (Render)
- **Repository**: `server` directory
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `MONGODB_URI`: MongoDB connection string
  - `JWT_SECRET`: Secret key for JWT
  - `AI_MODEL_URL`: `https://ai-model-p1xe.onrender.com`

### 3. AI Model (Render)
- **Repository**: `ai-model` directory
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `python server.py`
- **Environment Variables**:
  - `PYTHON_VERSION`: `3.10.0`
