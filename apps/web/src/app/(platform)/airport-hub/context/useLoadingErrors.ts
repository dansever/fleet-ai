import { useCallback, useState } from 'react';
import { ErrorState, LoadingState } from './types';

/**
 * Hook for managing loading and error states across different data domains
 */
export function useLoadingErrors(hasServerData: boolean) {
  // Loading states
  const [loading, setLoading] = useState<LoadingState>({
    airports: !hasServerData, // Start with true if no server data provided
    contracts: false,
    documents: false,
    vendorContacts: false,
    isRefreshing: false,
    uploadDocument: false,
  });

  // Error states
  const [errors, setErrors] = useState<ErrorState>({
    airports: null,
    contracts: null,
    documents: null,
    vendorContacts: null,
    general: null,
    uploadDocument: null,
  });

  /**
   * Clear a specific error
   */
  const clearError = useCallback((errorType: keyof ErrorState) => {
    setErrors((prev) => ({ ...prev, [errorType]: null }));
  }, []);

  /**
   * Clear all errors
   */
  const clearAllErrors = useCallback(() => {
    setErrors({
      airports: null,
      contracts: null,
      documents: null,
      vendorContacts: null,
      general: null,
      uploadDocument: null,
    });
  }, []);

  /**
   * Set upload loading state
   */
  const setUploadLoading = useCallback((isLoading: boolean) => {
    setLoading((prev) => ({ ...prev, uploadDocument: isLoading }));
    if (isLoading) {
      setErrors((prev) => ({ ...prev, uploadDocument: null }));
    }
  }, []);

  return {
    loading,
    setLoading,
    errors,
    setErrors,
    clearError,
    clearAllErrors,
    setUploadLoading,
  };
}
