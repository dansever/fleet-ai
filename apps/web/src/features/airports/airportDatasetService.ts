import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { AirportDatasetItem } from './airportDatasetType';

let cachedAirports: AirportDatasetItem[] | null = null;

export async function loadAirportDataset(): Promise<AirportDatasetItem[]> {
  if (cachedAirports) {
    return cachedAirports;
  }

  return new Promise((resolve, reject) => {
    const results: AirportDatasetItem[] = [];
    const csvPath = path.join(process.cwd(), 'public', 'data', 'airports.csv');

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        // Only include airports with meaningful names and IATA or ICAO codes
        if (data.airport && data.airport.trim() && (data.iata || data.icao)) {
          results.push({
            country_code: data.country_code,
            region_name: data.region_name,
            iata: data.iata || '',
            icao: data.icao || '',
            airport: data.airport,
            latitude: data.latitude || '',
            longitude: data.longitude || '',
          });
        }
      })
      .on('end', () => {
        cachedAirports = results;
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}
