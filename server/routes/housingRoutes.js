import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csv from "csv-parser";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to housing.csv (relative to server directory)
const HOUSING_CSV_PATH = path.join(__dirname, "../../ai-model/housing.csv");

// Cache for housing data
let housingDataCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Force cache clear on module load
housingDataCache = null;
cacheTimestamp = null;

// Helper function to parse CSV
const parseHousingCSV = () => {
    return new Promise((resolve, reject) => {
        const results = [];
        
        fs.createReadStream(HOUSING_CSV_PATH)
            .pipe(csv())
            .on('data', (data) => {
                // Clean and format the data
                // Clean and format the data (adapted for delhi.csv schema)
                const property = {
                    id: Math.random().toString(36).substr(2, 9),
                    price: parseFloat(data.Price) || 0,
                    address: data.Locality || '',
                    area: parseFloat(data.Area) || 0,
                    latitude: 0, // Not in delhi.csv
                    longitude: 0, // Not in delhi.csv
                    bedrooms: parseFloat(data.BHK) || 0,
                    bathrooms: parseFloat(data.Bathroom) || 0,
                    balcony: '', // Not in delhi.csv
                    status: data.Status || '',
                    neworold: data.Transaction || '',
                    parking: data.Parking || '',
                    furnished_status: data.Furnishing || '',
                    lift: '', // Not in delhi.csv
                    landmarks: '', // Not in delhi.csv
                    type_of_building: data.Type || '',
                    description: `${data.BHK} BHK ${data.Type} in ${data.Locality}`,
                    price_sqft: parseFloat(data.Per_Sqft) || 0
                };
                results.push(property);
            })
            .on('end', () => {
                resolve(results);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

// Get all housing properties with filtering and pagination
router.get("/", async (req, res) => {
    try {
        // Check if file exists
        if (!fs.existsSync(HOUSING_CSV_PATH)) {
            return res.status(404).json({
                success: false,
                error: "Housing data file not found"
            });
        }

        // Parse CSV if not cached or cache expired
        const now = Date.now();
        if (!housingDataCache || !cacheTimestamp || (now - cacheTimestamp) > CACHE_DURATION) {
            housingDataCache = await parseHousingCSV();
            cacheTimestamp = now;
        }

        let results = [...housingDataCache];

        // 1. Search Filter
        const searchQuery = req.query.search ? req.query.search.toLowerCase().trim() : '';
        if (searchQuery) {
            results = results.filter(p => {
                const address = (p.address || '').toLowerCase();
                const landmarks = (p.landmarks || '').toLowerCase();
                const buildingType = (p.type_of_building || '').toLowerCase();
                return address.includes(searchQuery) || landmarks.includes(searchQuery) || buildingType.includes(searchQuery);
            });
        }

        // 2. Advanced Filters
        if (req.query.minPrice) {
            results = results.filter(p => p.price >= parseFloat(req.query.minPrice));
        }
        if (req.query.maxPrice) {
            results = results.filter(p => p.price <= parseFloat(req.query.maxPrice));
        }
        if (req.query.minArea) {
            results = results.filter(p => p.area >= parseFloat(req.query.minArea));
        }
        if (req.query.maxArea) {
            results = results.filter(p => p.area <= parseFloat(req.query.maxArea));
        }
        if (req.query.bedrooms) {
            results = results.filter(p => p.bedrooms === parseFloat(req.query.bedrooms));
        }
        if (req.query.status) {
            results = results.filter(p => p.status === req.query.status);
        }
        if (req.query.furnished) {
            results = results.filter(p => p.furnished_status === req.query.furnished);
        }
        if (req.query.buildingType) {
            results = results.filter(p => p.type_of_building === req.query.buildingType);
        }

        // 3. Sorting
        const sortBy = req.query.sortBy || 'price';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

        results.sort((a, b) => {
            let aVal = a[sortBy] || 0;
            let bVal = b[sortBy] || 0;
            
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();

            if (aVal > bVal) return sortOrder;
            if (aVal < bVal) return -sortOrder;
            return 0;
        });

        // 4. Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        const paginatedResults = results.slice(startIndex, endIndex);

        res.json({
            success: true,
            count: paginatedResults.length,
            total: results.length,
            totalPages: Math.ceil(results.length / limit),
            currentPage: page,
            properties: paginatedResults
        });
    } catch (error) {
        console.error("Error reading housing data:", error);
        res.status(500).json({
            success: false,
            error: "Failed to load housing data",
            details: error.message
        });
    }
});

export default router;

