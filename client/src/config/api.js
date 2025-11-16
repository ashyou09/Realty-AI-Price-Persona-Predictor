// API Configuration
// Use relative paths in development (proxied by Vite), absolute URL in production
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isDevelopment 
? '/api' 
: 'https://realty-ai-price-persona-predictor.onrender.com/api';

export default API_BASE_URL;
