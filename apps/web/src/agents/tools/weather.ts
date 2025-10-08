import { serverEnv } from '@/lib/env/server';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';

const BASE_URL = 'https://api.weatherapi.com/v1'; // use HTTPS

export const getWeather = tool(
  async (opts: { location: string; includeAQI?: boolean }) => {
    const { location, includeAQI = false } = opts;

    // Basic validation / sanitization
    if (!location || typeof location !== 'string') {
      throw new Error('Invalid location parameter');
    }
    // Optionally: reject weird characters etc if needed

    const url = new URL(`${BASE_URL}/current.json`);
    url.searchParams.set('key', serverEnv.WEATHER_API_KEY);
    url.searchParams.set('q', location);
    if (includeAQI) {
      url.searchParams.set('aqi', 'yes');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5_000); // 5s timeout

    let response: Response;
    try {
      response = await fetch(url.toString(), { signal: controller.signal });
    } catch (err) {
      throw new Error(`Weather API request failed: ${String(err)}`);
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      let errText: string;
      try {
        const errJson = await response.json();
        errText = JSON.stringify(errJson);
      } catch {
        errText = await response.text();
      }
      throw new Error(`Weather API responded with ${response.status}: ${errText}`);
    }

    const data = await response.json();

    // Optionally: pick and return a normalized subset rather than full raw JSON
    const result = {
      location: {
        name: data.location?.name,
        region: data.location?.region,
        country: data.location?.country,
        localtime: data.location?.localtime,
      },
      current: {
        temp_c: data.current?.temp_c,
        temp_f: data.current?.temp_f,
        condition: data.current?.condition, // includes text, icon, code
      },
      raw: data, // keep full data if you need fallback
    };

    return result;
  },
  {
    name: 'getWeather',
    description: 'Get the current weather for a given location, optionally with AQI data',
    schema: z.object({
      location: z.string().describe('City name, postal code, or lat,lon'),
      includeAQI: z.boolean().optional().describe('Whether to include air quality data'),
    }),
  },
);
