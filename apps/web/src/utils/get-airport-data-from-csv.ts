import Papa from 'papaparse';

export type Airport = {
  code: string;
  name: string;
  city: string;
  country: string;
  [key: string]: string | number | boolean | null;
};

export async function fetchAirportByCode(
  code: string,
): Promise<Airport | null> {
  try {
    const res = await fetch('/data/airports_dataset.csv');
    if (!res.ok) throw new Error('Failed to load airport data');

    const csvText = await res.text();

    const parsed = Papa.parse<Airport>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length) {
      console.error('CSV parse errors:', parsed.errors);
      return null;
    }

    const airport = parsed.data.find(
      (row: { code: string }) => row.code?.toLowerCase() === code.toLowerCase(),
    );

    return airport || null;
  } catch (err) {
    console.error('Error fetching airport data:', err);
    return null;
  }
}
