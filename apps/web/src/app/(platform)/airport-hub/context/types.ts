import { Airport, Contract, Document, User, VendorContact } from '@/drizzle/types';

/**
 * Loading state for different data domains in the Airport Hub
 */
export type LoadingState = {
  airports: boolean;
  contracts: boolean;
  documents: boolean;
  vendorContacts: boolean;
  isRefreshing: boolean; // Indicates if current loading is from a refresh action
  uploadDocument: boolean;
};

/**
 * Error state for different data domains in the Airport Hub
 */
export type ErrorState = {
  airports: string | null;
  contracts: string | null;
  documents: string | null;
  vendorContacts: string | null;
  general: string | null;
  uploadDocument: string | null;
};

/**
 * Main context type for Airport Hub
 * Provides access to all airport-related data and operations
 */
export type AirportHubContextType = {
  // User
  dbUser: User;

  // Airports
  airports: Airport[];
  setAirports: (airports: Airport[]) => void;
  selectedAirport: Airport | null;
  setSelectedAirport: (airport: Airport | null) => void;
  refreshAirports: () => Promise<void>;
  updateAirport: (updatedAirport: Airport) => void;
  addAirport: (newAirport: Airport) => void;
  deleteAirport: (airportId: Airport['id']) => Promise<void>;

  // Contracts
  contracts: Contract[];
  setContracts: (contracts: Contract[]) => void;
  selectedContract: Contract | null;
  setSelectedContract: (contract: Contract | null) => void;
  refreshContracts: () => Promise<void>;
  updateContract: (updatedContract: Contract) => void;
  addContract: (newContract: Contract) => void;
  removeContract: (contractId: Contract['id']) => void;

  // Documents
  documents: Document[];
  setDocuments: (documents: Document[]) => void;
  refreshDocuments: () => Promise<void>;
  updateDocument: (updatedDocument: Document) => void;
  addDocument: (newDocument: Document) => void;
  removeDocument: (documentId: Document['id']) => void;
  selectedDocument: Document | null;
  setSelectedDocument: (document: Document | null) => void;

  // Vendor Contacts
  vendorContacts: VendorContact[];
  setVendorContacts: (vendorContacts: VendorContact[]) => void;
  selectedVendorContact: VendorContact | null;
  setSelectedVendorContact: (vendorContact: VendorContact | null) => void;
  refreshVendorContacts: () => Promise<void>;
  updateVendorContact: (updatedVendorContact: VendorContact) => void;
  addVendorContact: (newVendorContact: VendorContact) => void;
  removeVendorContact: (vendorContactId: VendorContact['id']) => void;

  // Loading and error states
  loading: LoadingState;
  errors: ErrorState;
  clearError: (errorType: keyof ErrorState) => void;
  clearAllErrors: () => void;
  setUploadLoading: (isLoading: boolean) => void;

  // Cache management
  clearAllCaches: () => void;
};
