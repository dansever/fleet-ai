import { Contract, Document } from '@/drizzle/types';
import { client as documentClient } from '@/modules/documents/documents';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ErrorState, LoadingState } from './types';

type UseDocumentsProps = {
  selectedContract: Contract | null;
  setLoading: React.Dispatch<React.SetStateAction<LoadingState>>;
  setErrors: React.Dispatch<React.SetStateAction<ErrorState>>;
  documentsCache: Record<string, Document[]>;
  setDocumentsCache: React.Dispatch<React.SetStateAction<Record<string, Document[]>>>;
  cleanupCache: <T>(cache: Record<string, T>, currentItemId?: string) => Record<string, T>;
};

/**
 * Hook for managing documents state and operations
 */
export function useDocuments({
  selectedContract,
  setLoading,
  setErrors,
  documentsCache,
  setDocumentsCache,
  cleanupCache,
}: UseDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  /**
   * Load documents for the selected contract (only when contract changes)
   *
   * Flow:
   * 1. Check cache for documents
   * 2. If found, set documents and select first document
   * 3. If not found, fetch from server, cache, and select first document
   *
   * This effect is triggered automatically when a contract is selected,
   * ensuring documents are always loaded when viewing a contract.
   */
  useEffect(() => {
    if (!selectedContract) {
      console.log('No contract selected, clearing documents');
      setDocuments([]);
      setSelectedDocument(null);
      return;
    }

    console.log(`Contract selected: ${selectedContract.id}, loading documents...`);

    // Immediately clear documents to show loading state and prevent showing stale data
    setDocuments([]);
    setSelectedDocument(null);

    // Store contract ID to handle race conditions
    const contractId = selectedContract.id;
    let isCancelled = false;

    const loadDocuments = async () => {
      // Check cache first
      if (documentsCache[contractId] !== undefined) {
        if (isCancelled) return;
        const cachedDocuments = documentsCache[contractId];
        setDocuments(cachedDocuments);
        setSelectedDocument(cachedDocuments.length > 0 ? cachedDocuments[0] : null);
        console.log(
          `✓ Loaded ${cachedDocuments.length} documents from cache for contract ${contractId}`,
        );
        return;
      }

      console.log(`⟳ Fetching documents from server for contract ${contractId}...`);

      setLoading((prev) => ({ ...prev, documents: true, isRefreshing: false }));
      setErrors((prev) => ({ ...prev, documents: null }));

      try {
        const contractDocuments = await documentClient.listDocumentsByContract(contractId);

        // Check if this request is still relevant (user might have switched contracts)
        if (isCancelled || selectedContract?.id !== contractId) {
          console.log(`✗ Discarding documents for ${contractId} (contract changed)`);
          return;
        }

        setDocuments(contractDocuments);

        // Cache the documents for this contract
        setDocumentsCache((prev) => {
          const updated = {
            ...prev,
            [contractId]: contractDocuments,
          };
          return cleanupCache(updated, contractId);
        });

        // Set first document as selected when loading documents for a new contract
        setSelectedDocument(contractDocuments.length > 0 ? contractDocuments[0] : null);
        console.log(
          `✓ Successfully loaded ${contractDocuments.length} documents for contract ${contractId}`,
        );
      } catch (error) {
        // Only show error if this request is still relevant
        if (!isCancelled && selectedContract?.id === contractId) {
          console.error('✗ Error loading documents:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to load documents';
          setErrors((prev) => ({
            ...prev,
            documents: errorMessage,
          }));
          setDocuments([]);
          setSelectedDocument(null);

          // Show user-friendly toast notification
          toast.error(`Failed to load documents: ${errorMessage}`);
        }
      } finally {
        if (!isCancelled) {
          setLoading((prev) => ({ ...prev, documents: false, isRefreshing: false }));
        }
      }
    };

    loadDocuments();

    // Cleanup function to cancel ongoing requests if contract changes
    return () => {
      isCancelled = true;
    };
  }, [selectedContract, cleanupCache, setLoading, setErrors, documentsCache, setDocumentsCache]);

  /**
   * Refresh documents for the currently selected contract (clears cache)
   */
  const refreshDocuments = useCallback(async () => {
    if (!selectedContract) {
      console.log('Cannot refresh documents: no contract selected');
      return;
    }

    console.log(`⟳ Refreshing documents for contract ${selectedContract.id}...`);

    // Clear cache for this contract to force fresh data
    setDocumentsCache((prev) => {
      const updated = { ...prev };
      delete updated[selectedContract.id];
      console.log(`🗑️ Cleared cache for contract ${selectedContract.id}`);
      return updated;
    });

    setLoading((prev) => ({ ...prev, documents: true, isRefreshing: true }));
    setErrors((prev) => ({ ...prev, documents: null }));

    try {
      const contractDocuments = await documentClient.listDocumentsByContract(selectedContract.id);
      setDocuments(contractDocuments);

      // Update cache with fresh data
      setDocumentsCache((prev) => {
        const updated = {
          ...prev,
          [selectedContract.id]: contractDocuments,
        };
        return cleanupCache(updated, selectedContract.id);
      });

      // Preserve the currently selected document if it still exists, otherwise select first
      if (selectedDocument) {
        const updatedSelectedDocument = contractDocuments.find((d) => d.id === selectedDocument.id);
        setSelectedDocument(
          updatedSelectedDocument || (contractDocuments.length > 0 ? contractDocuments[0] : null),
        );
      } else if (contractDocuments.length > 0) {
        setSelectedDocument(contractDocuments[0]);
      }

      console.log(
        `✓ Refreshed ${contractDocuments.length} documents for contract ${selectedContract.id}`,
      );
    } catch (error) {
      console.error('✗ Error refreshing documents:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh documents';
      setErrors((prev) => ({
        ...prev,
        documents: errorMessage,
      }));
      toast.error(`Failed to refresh documents: ${errorMessage}`);
    } finally {
      setLoading((prev) => ({ ...prev, documents: false, isRefreshing: false }));
    }
  }, [selectedContract, selectedDocument, cleanupCache, setLoading, setErrors, setDocumentsCache]);

  /**
   * Update document in state and cache
   */
  const updateDocument = useCallback(
    (updatedDocument: Document) => {
      setDocuments((prevDocuments) =>
        prevDocuments.map((document) =>
          document.id === updatedDocument.id ? updatedDocument : document,
        ),
      );

      // Update cache as well
      if (selectedContract) {
        setDocumentsCache((prev) => ({
          ...prev,
          [selectedContract.id]:
            prev[selectedContract.id]?.map((document) =>
              document.id === updatedDocument.id ? updatedDocument : document,
            ) || [],
        }));
      }
    },
    [selectedContract, setDocumentsCache],
  );

  /**
   * Add document to state and cache
   */
  const addDocument = useCallback(
    (newDocument: Document) => {
      console.log(`➕ Adding new document: ${newDocument.id} (${newDocument.fileName})`);

      setDocuments((prevDocuments) => [newDocument, ...prevDocuments]);

      // Update cache as well
      if (selectedContract && selectedContract.id === newDocument.parentId) {
        setDocumentsCache((prev) => {
          const updated = {
            ...prev,
            [selectedContract.id]: [newDocument, ...(prev[selectedContract.id] || [])],
          };
          return cleanupCache(updated, selectedContract.id);
        });

        // Always select the newly added document so user can see what they just uploaded
        setSelectedDocument(newDocument);
        console.log(`✓ Document added and selected: ${newDocument.fileName}`);
      } else {
        console.warn(
          `⚠️ Document added but not cached (contract mismatch or no selected contract)`,
        );
      }
    },
    [selectedContract, cleanupCache, setDocumentsCache],
  );

  /**
   * Remove document from state and cache
   */
  const removeDocument = useCallback(
    (documentId: string) => {
      console.log(`🗑️ Removing document: ${documentId}`);

      setDocuments((prevDocuments) => {
        const filteredDocuments = prevDocuments.filter((document) => document.id !== documentId);

        // If we're removing the currently selected document, select the first available one
        if (selectedDocument?.id === documentId) {
          const newSelection = filteredDocuments.length > 0 ? filteredDocuments[0] : null;
          setSelectedDocument(newSelection);
          console.log(`Document was selected, switching to: ${newSelection?.fileName || 'none'}`);
        }

        return filteredDocuments;
      });

      // Update cache as well
      if (selectedContract) {
        setDocumentsCache((prev) => ({
          ...prev,
          [selectedContract.id]:
            prev[selectedContract.id]?.filter((document) => document.id !== documentId) || [],
        }));
      }

      console.log(`✓ Document removed successfully`);
    },
    [selectedContract, selectedDocument, setDocumentsCache],
  );

  return {
    documents,
    setDocuments,
    selectedDocument,
    setSelectedDocument,
    refreshDocuments,
    updateDocument,
    addDocument,
    removeDocument,
  };
}
