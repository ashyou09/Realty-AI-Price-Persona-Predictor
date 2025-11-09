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

// Helper function to parse CSV
const parseHousingCSV = () => {
    return new Promise((resolve, reject) => {
        const results = [];
        
        fs.createReadStream(HOUSING_CSV_PATH)
            .pipe(csv())
            .on('data', (data) => {
                // Clean and format the data
                const property = {
                    id: data[''] || Math.random().toString(36).substr(2, 9),
                    price: parseFloat(data.price) || 0,
                    address: data.Address || '',
                    area: parseFloat(data.area) || 0,
                    latitude: parseFloat(data.latitude) || 0,
                    longitude: parseFloat(data.longitude) || 0,
                    bedrooms: parseFloat(data.Bedrooms) || 0,
                    bathrooms: parseFloat(data.Bathrooms) || 0,
                    balcony: data.Balcony || '',
                    status: data.Status || '',
                    neworold: data.neworold || '',
                    parking: data.parking || '',
                    furnished_status: data.Furnished_status || '',
                    lift: data.Lift || '',
                    landmarks: data.Landmarks || '',
                    type_of_building: data.type_of_building || '',
                    description: data.desc || '',
                    price_sqft: parseFloat(data.Price_sqft) || 0
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

// Get all housing properties
router.get("/", async (req, res) => {
    try {
        // Check if cache is valid
        const now = Date.now();
        if (housingDataCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
            return res.json({
                success: true,
                count: housingDataCache.length,
                properties: housingDataCache
            });
        }

        // Check if file exists
        if (!fs.existsSync(HOUSING_CSV_PATH)) {
            return res.status(404).json({
                success: false,
                error: "Housing data file not found"
            });
        }

        // Parse CSV and cache
        const properties = await parseHousingCSV();
        housingDataCache = properties;
        cacheTimestamp = now;

        res.json({
            success: true,
            count: properties.length,
            properties: properties
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

