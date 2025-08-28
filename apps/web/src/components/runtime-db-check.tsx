'use client';

import { useEffect } from 'react';

/**
 * Component that checks database connectivity at runtime (not during build)
 * This replaces the build-time database check that was causing deployment issues
 */
export default function RuntimeDbCheck() {
  useEffect(() => {
    // Only check database connectivity in production and when running client-side
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Make a simple health check API call to verify database connectivity
      fetch('/api/health')
        .then((response) => {
          if (!response.ok) {
            console.warn('Database health check failed:', response.status);
          }
        })
        .catch((error) => {
          console.warn('Database connectivity check failed:', error);
        });
    }
  }, []);

  // This component renders nothing - it's just for the side effect
  return null;
}
