// src/app/BackendApiAuth.tsx
'use client';

import { backendApi } from '@/services/api-client';
import { useAuth } from '@clerk/nextjs';
import { useCallback, useEffect } from 'react';

export default function BackendApiAuth() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  // Memoize the interceptor function to prevent unnecessary re-creations
  const createInterceptor = useCallback(
    async (config: any) => {
      const token = await getToken({ template: 'fleet-ai-jwt-template' });
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    [getToken],
  );

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return; // avoid SSR/client mismatch

    const id = backendApi.interceptors.request.use(createInterceptor);
    return () => backendApi.interceptors.request.eject(id);
  }, [createInterceptor, isLoaded, isSignedIn]);

  return null;
}
