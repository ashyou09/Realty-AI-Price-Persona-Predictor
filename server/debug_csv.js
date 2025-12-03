import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const results = [];
const filePath = path.join(__dirname, '../ai-model/housing.csv');

fs.createReadStream(filePath)
  .pipe(csv())
  .on('data', (data) => {
    if (results.length === 0) {
        console.log('Headers:', Object.keys(data));
        console.log('First row:', data);
    }
    results.push(data);
  })
  .on('end', () => {
    console.log('Done.');
  });
