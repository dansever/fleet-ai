// src/services/apiClient.ts
// Axious Client

import { env } from '@/lib/env/client';
import axios, { AxiosInstance } from 'axios';

/**
 * API client for calling Next.js API routes from the frontend.
 * Example: /api/quotes, /api/users
 */
export const api = axios.create({
  baseURL: env.NEXT_PUBLIC_API_BASE_URL, // e.g., "http://localhost:3000"
});

/**
 * API client for calling external backend (e.g., FastAPI) from the frontend.
 * Example: http://localhost:8000 or deployed backend URL
 */
export const backendApi = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL, // e.g., "http://localhost:8000"
});

// ------------------------ DEBUGGING ------------------------

function attachDebug(i: AxiosInstance, label: string) {
  i.interceptors.request.use((cfg) => {
    const url = `${cfg.baseURL ?? ''}${cfg.url ?? ''}`;
    console.log(`[${label}] → ${cfg.method?.toUpperCase() || 'GET'} ${url}`);
    if (cfg.data) {
      console.log(`   ↳ request data:`, cfg.data);
    }
    if (cfg.params) {
      console.log(`   ↳ query params:`, cfg.params);
    }
    return cfg;
  });

  i.interceptors.response.use(
    (res) => {
      console.log(`[${label}] ← ${res.status} ${res.config.url}`);
      if (res.data) {
        console.log(`   ↳ response data:`, res.data);
      }
      return res;
    },
    (err) => {
      const url = err.config?.url ?? 'unknown';
      const status = err.response?.status ?? 'no-response';
      console.log(`[${label}] × ${status} ${url} ${err.message}`);
      if (err.response?.data) {
        console.log(`   ↳ error data:`, err.response.data);
      }
      return Promise.reject(err);
    },
  );
}

attachDebug(api, 'NextAPI');
attachDebug(backendApi, 'Backend');
