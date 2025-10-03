# Unified File Processing System

This module provides a unified, scalable approach to file upload and extraction processing for all document types in the FleetAI application.

## Overview

The unified file processing system consolidates multiple scattered endpoints and processing flows into a single, configuration-driven pipeline that handles all document types (contracts, fuel bids, quotes, RFQs) through a consistent interface.

## Architecture

### Core Components

1. **Base Processor** (`processors/base.processor.ts`)
   - Abstract base class that defines the standard processing pipeline
   - Handles common operations: validation, storage, parsing, extraction, and document updates

2. **Document-Specific Processors** (`processors/`)
   - `ContractProcessor` - Handles contract documents with chunking and embeddings
   - `FuelBidProcessor` - Handles fuel bid documents with specialized data transformation
   - `QuoteProcessor` - Handles quote documents
   - `RfqProcessor` - Handles RFQ documents

3. **Unified API Endpoint** (`/api/files/process`)
   - Single endpoint that replaces multiple scattered endpoints
   - Configuration-driven processing based on document type
   - Consistent request/response format

4. **Client Utilities** (`files.client.ts`)
   - Client-side validation and upload utilities
   - Progress tracking and error handling
   - Type-safe API interactions

## Usage

### Backend (Server-side)

```typescript
import { server as filesServer } from '@/modules/files';

// Process any document type
const result = await filesServer.processFile({
  file: uploadedFile,
  documentType: 'contract', // 'contract' | 'fuel_bid' | 'quote' | 'rfq'
  parentId: contractId,
  orgId: userOrgId,
  userId: userId,
});
```

### Frontend (Client-side)

```typescript
import { client as filesClient } from '@/modules/files';

// Upload and process a file
const result = await filesClient.uploadAndProcessFile(file, {
  documentType: 'contract',
  parentId: contractId,
  onProgress: (progress) => console.log(`Progress: ${progress}%`),
});
```

### React Component

```tsx
import { UnifiedFileUpload } from '@/components/file-upload/UnifiedFileUpload';

<UnifiedFileUpload
  documentType="contract"
  parentId={contractId}
  onSuccess={(result) => console.log('Upload successful:', result)}
  onError={(error) => console.error('Upload failed:', error)}
/>;
```

## Processing Pipeline

The unified processing pipeline follows these steps for all document types:

1. **Validation** - File type, size, and custom validation checks
2. **Document Creation** - Create document record in database
3. **Storage Upload** - Upload file to storage service
4. **Parsing & Extraction** - Simultaneous document parsing and data extraction
5. **Data Transformation** - Document-specific data transformation
6. **Database Update** - Update document record with extracted data
7. **Chunking & Embeddings** - Create text chunks and embeddings (if configured)

## Configuration

Each document type has its own processor configuration:

```typescript
interface ProcessorConfig {
  extractionAgent: ExtractionAgentName; // LlamaCloud extraction agent
  requiresChunking: boolean; // Whether to create text chunks
  requiresEmbeddings: boolean; // Whether to create embeddings
  customValidation?: (file: File) => Promise<boolean>;
  dataTransformer?: (extractedData: any) => any;
}
```

## Migration from Legacy Endpoints

### Removed Endpoints

The following endpoints have been removed and replaced with the unified API:

- `/api/extract/start` → **REMOVED** - Use `/api/files/process`
- `/api/extract/upload` → **REMOVED** - Use `/api/files/process`
- `/api/documents/process/contract` → **REMOVED** - Use `/api/files/process`
- `/api/documents/process/fuel_bid` → **REMOVED** - Use `/api/files/process`
- `/api/fuel/bids/extract` → **REMOVED** - Use `/api/files/process`

### Migration Guide

#### 1. Update API Calls

**Before:**

```typescript
// Old contract processing
const formData = new FormData();
formData.append('file', file);
formData.append('parentType', 'contract');
formData.append('parentId', contractId);

const response = await fetch('/api/documents/process/contract', {
  method: 'POST',
  body: formData,
});
```

**After:**

```typescript
// New unified processing
const formData = new FormData();
formData.append('file', file);
formData.append('documentType', 'contract');
formData.append('parentId', contractId);

const response = await fetch('/api/files/process', {
  method: 'POST',
  body: formData,
});
```

#### 2. Update Client Code

**Before:**

```typescript
// Legacy approach - multiple different client imports and functions
import { client as processDocumentClient } from '@/modules/documents/orchastration';
import { ExtractFuelBid } from '@/modules/fuel/bids/bids.client';

await processDocumentClient.processDocument(file, options);
await ExtractFuelBid(tenderId, file);
```

**After:**

```typescript
import { client as filesClient } from '@/modules/files';

// Single unified client function
await filesClient.uploadAndProcessFile(file, {
  documentType: 'contract',
  parentId: contractId,
});
```

## Benefits

1. **Consistency** - All document types follow the same processing pipeline
2. **Maintainability** - Single codebase to maintain instead of multiple scattered implementations
3. **Scalability** - Easy to add new document types by creating new processors
4. **Type Safety** - Strong TypeScript typing throughout the system
5. **Error Handling** - Consistent error handling and reporting
6. **Performance** - Optimized processing with parallel operations where possible

## Adding New Document Types

To add a new document type:

1. **Add to DocumentType enum** in `@/drizzle/enums`
2. **Add extraction agent** in `@/lib/constants/extractionAgents`
3. **Create processor class** extending `BaseFileProcessor`
4. **Register processor** in `files.server.ts`
5. **Update type mappings** as needed

Example:

```typescript
// processors/invoice.processor.ts
export class InvoiceProcessor extends BaseFileProcessor {
  readonly documentType: DocumentType = 'invoice';
  readonly config: ProcessorConfig = {
    extractionAgent: ExtractionAgentName.INVOICE_EXTRACTOR,
    requiresChunking: false,
    requiresEmbeddings: false,
  };

  transform(extractedData: any): any {
    // Invoice-specific transformation logic
    return transformInvoiceData(extractedData);
  }
}
```

## Error Handling

The system provides comprehensive error handling at multiple levels:

- **Client-side validation** - File type, size, format validation
- **Server-side validation** - Business logic validation
- **Processing errors** - Extraction, parsing, storage errors
- **Graceful degradation** - Partial success handling

## Performance Considerations

- **Parallel processing** - Parsing and extraction run simultaneously
- **Streaming uploads** - Large file support with progress tracking
- **Caching** - Processor instances are cached for performance
- **Resource management** - Proper cleanup and memory management

## Testing

The system includes comprehensive testing:

- **Unit tests** - Individual processor testing
- **Integration tests** - End-to-end processing pipeline
- **Performance tests** - Load and stress testing
- **Error scenario tests** - Failure mode testing
