// src/app/BackendApiAuth.tsx
'use client';

import { backendApi } from '@/services/api-client';
import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';

export default function BackendApiAuth() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return; // avoid SSR/client mismatch
    const id = backendApi.interceptors.request.use(async (config) => {
      const token = await getToken({ template: 'fleet-ai-jwt-template' });
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    return () => backendApi.interceptors.request.eject(id);
  }, [getToken, isLoaded, isSignedIn]);

  return null;
}
