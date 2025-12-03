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

