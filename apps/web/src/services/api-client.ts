// src/services/apiClient.ts
// Axios Client

import { env } from '@/lib/env/client';
import axios, { AxiosInstance } from 'axios';

/**
 * API client for calling Next.js API routes from the frontend.
 * Example: /api/quotes, /api/users
 */
export const api = axios.create({
  baseURL: `${env.NEXT_PUBLIC_APP_URL}`,
});

/**
 * API client for calling FastAPI backend directly from the frontend.
 * Example: /api/airports, /api/users
 */
export const backendApi = axios.create({
  baseURL: env.NEXT_PUBLIC_BACKEND_URL,
});

// ------------------------ DEBUGGING ------------------------

const isDebugMode = env.NEXT_PUBLIC_DEBUG_MODE;

function attachDebug(instance: AxiosInstance, label: string) {
  instance.interceptors.request.use((config) => {
    const url = `${config.baseURL ?? ''}${config.url ?? ''}`;
    console.log(`[${label}] → ${config.method?.toUpperCase() || 'GET'} ${url}`);

    if (isDebugMode) {
      if (config.data) {
        console.log(`   ↳ request data:`, config.data);
      }
      if (config.params) {
        console.log(`   ↳ query params:`, config.params);
      }
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      console.log(`[${label}] ← ${response.status} ${response.config.url}`);

      if (isDebugMode && response.data) {
        console.log(`   ↳ response data:`, response.data);
      }
      return response;
    },
    (error) => {
      const url = error.config?.url ?? 'unknown';
      const status = error.response?.status ?? 'no-response';
      console.log(`[${label}] × ${status} ${url} ${error.message}`);

      if (isDebugMode && error.response?.data) {
        console.log(`   ↳ error data:`, error.response.data);
      }
      return Promise.reject(error);
    },
  );
}

attachDebug(api, 'NextAPI');
attachDebug(backendApi, 'Backend');
