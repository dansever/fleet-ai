# Files Module

**Purpose:** Unified module for all file-related operations in FleetAI - handles both Supabase storage operations and document processing (extraction, parsing, embeddings).

---

## 📁 Folder Structure

```
files/
├── storage/                      # Supabase storage operations
│   ├── storage.server.ts         # Server-side: upload, download, delete, sign URLs
│   ├── storage.client.ts         # Client-side: API calls to storage routes
│   ├── storage.utils.ts          # Utilities: bucket naming, path generation
│   └── index.ts                  # Storage exports
│
├── processors/                   # Document type-specific processing logic
│   ├── base.processor.ts         # Abstract base class for all processors
│   ├── contract.processor.ts     # Contract processing (with chunking/embeddings)
│   ├── fuel-bid.processor.ts     # Fuel bid processing
│   ├── quote.processor.ts        # Quote processing
│   └── rfq.processor.ts          # RFQ processing
│
├── files.server.ts               # Processing orchestration (server-side)
├── files.client.ts               # Processing client utilities
├── files.types.ts                # TypeScript type definitions
├── index.ts                      # Main module exports
└── README.md                     # This file
```

---

## 🎯 Component Overview

### Storage Sub-module (`storage/`)

**What it does:** Low-level Supabase file storage operations

**Key functions:**

- `uploadFile()` - Upload files to org-specific Supabase bucket
- `downloadFile()` - Download file blobs from storage
- `deleteFile()` - Remove files from storage
- `createSignedUrl()` - Generate temporary secure URLs for file access
- `listFiles()` - List files by document type
- `getBucketName()` - Get organization bucket name
- `generateStoragePath()` - Create unique file paths

**Files:**

- `storage.server.ts` - Server-side functions (direct Supabase calls)
- `storage.client.ts` - Client-side functions (API route wrappers)
- `storage.utils.ts` - Helper functions for bucket/path management

---

### Processors (`processors/`)

**What it does:** Document-specific processing pipelines

**Base Processor** (`base.processor.ts`):

- Abstract class defining standard processing pipeline
- Steps: validate → create DB record → upload to storage → parse & extract → transform → update DB → chunk & embed
- Shared logic for all document types

**Document Processors:**

- `ContractProcessor` - Contracts with full-text search (chunking + embeddings)
- `FuelBidProcessor` - Fuel bids with specialized data transformation
- `QuoteProcessor` - Vendor quotes
- `RfqProcessor` - Request for quotes

Each processor:

- Extends `BaseFileProcessor`
- Defines extraction agent to use
- Configures chunking/embedding requirements
- Implements custom data transformation

---

### Processing Orchestration (`files.server.ts`)

**What it does:** Coordinates file processing across all document types

**Key functions:**

- `processFile()` - Main entry point: validates, gets processor, executes pipeline
- `validateFile()` - Pre-upload validation
- `getProcessor()` - Returns processor for specific document type
- `getSupportedDocumentTypes()` - Lists all registered document types

**How it works:**

1. Registry pattern stores document type → processor mappings
2. Single function handles all document types
3. Processors execute their specific logic

---

### Client Utilities (`files.client.ts`)

**What it does:** Client-side helpers for file uploads and processing

**Key functions:**

- `uploadAndProcessFile()` - Upload file and trigger processing via API
- `validateFileClient()` - Client-side validation (size, type)
- `getSupportedFileTypes()` - Returns allowed file extensions

---

### Types (`files.types.ts`)

**What it does:** TypeScript type definitions

**Categories:**

- **File Processing Types** - `FileProcessingRequest`, `FileProcessingResult`, `ProcessingContext`
- **Processor Types** - `FileProcessor`, `ProcessorConfig`, `ProcessorRegistry`
- **Client Types** - `FileUploadOptions`, `FileUploadResponse`
- **Progress Types** - `ProcessingStep`, `ProcessingProgressCallback`

---

## 💻 Usage Examples

### Storage Operations

```typescript
import { storage } from '@/modules/files';

// Server-side
const result = await storage.server.uploadFile(file, 'contract', contractId);
await storage.server.deleteFile('contracts/example.pdf');
const { signedUrl } = await storage.server.createSignedUrl(orgId, path, 3600);

// Client-side
await storage.client.uploadFile(file, 'contract');
const url = await storage.client.getSignedUrl(path);
```

### Document Processing

```typescript
import { server as filesServer, client as filesClient } from '@/modules/files';

// Server-side
const result = await filesServer.processFile({
  file,
  documentType: 'contract',
  parentId: contractId,
  orgId,
  userId,
});

// Client-side
const result = await filesClient.uploadAndProcessFile(file, {
  documentType: 'contract',
  parentId: contractId,
  onProgress: (progress) => console.log(`${progress}%`),
});
```

### Type Imports

```typescript
import type { FileUploadOptions, FileProcessingRequest, ProcessorConfig } from '@/modules/files';
```

---

## 🔄 Processing Pipeline

Standard flow for all document types:

1. **Validate** → Check file type, size, custom rules
2. **Create Document** → Insert DB record with pending status
3. **Upload to Storage** → Save file to Supabase bucket
4. **Parse & Extract** → Run parser + extraction agent (parallel)
5. **Transform** → Document-specific data transformation
6. **Update Document** → Save extracted data to DB
7. **Chunk & Embed** → Create searchable chunks (if configured)

Each processor can customize steps 5-7.

---

## 🔑 Key Concepts

**Naming Conventions:**

- `storage` → Supabase file storage (binary files)
- `documents` → PostgreSQL records (metadata + extracted data)
- `processors` → Document type-specific business logic

**API Routes:**

- `/api/storage/*` → Storage operations (upload, download, delete, list, sign)
- `/api/files/process` → Unified document processing endpoint

**Configuration:**
Each processor defines:

- Which extraction agent to use
- Whether to create chunks (for search)
- Whether to generate embeddings (for semantic search)
- Custom validation rules
- Data transformation logic

---

## ➕ Adding New Document Types

1. Add enum value to `DocumentType` in `@/drizzle/enums`
2. Create extraction agent in `@/lib/constants/extractionAgents`
3. Create new processor extending `BaseFileProcessor`:
   ```typescript
   export class InvoiceProcessor extends BaseFileProcessor {
     readonly documentType: DocumentType = 'invoice';
     readonly config: ProcessorConfig = {
       extractionAgent: ExtractionAgentName.INVOICE_EXTRACTOR,
       requiresChunking: false,
       requiresEmbeddings: false,
     };
     transform(extractedData: any) {
       return transformInvoiceData(extractedData);
     }
   }
   ```
4. Register processor in `files.server.ts` registry

---

## ✅ Benefits

- **Single Module** - All file operations in one place
- **Consistent API** - Same pattern for all document types
- **Type-Safe** - Full TypeScript support
- **Scalable** - Easy to add new document types
- **Maintainable** - DRY principle, shared base logic
- **Performant** - Optimized with parallel operations
