# File Manager Module

**Purpose:** Unified module for all file and document management operations in FleetAI. Handles storage, document processing, chunking, embeddings, and complex orchestration workflows.

---

## 📁 Folder Structure

```
file-manager/
├── storage/                       # Cloud storage operations (provider-agnostic)
│   ├── storage.server.ts          # Server-side: upload, download, delete, sign URLs
│   ├── storage.client.ts          # Client-side: API calls to storage routes
│   ├── storage.utils.ts           # Utilities: bucket naming, path generation
│   └── index.ts                   # Storage exports
│
├── documents/                     # Document management (DB records)
│   ├── documents.server.ts        # Server-side document CRUD operations
│   ├── documents.client.ts        # Client-side document API calls
│   ├── documents.types.ts         # Document type definitions
│   └── index.ts                   # Document exports
│
├── chunks/                        # Document chunking for RAG/search
│   ├── chunks.server.ts           # Server-side chunk creation and management
│   ├── chunks.client.ts           # Client-side chunk API calls
│   ├── chunks.types.ts            # Chunk type definitions
│   └── index.ts                   # Chunk exports
│
├── processors/                    # Document type-specific processing logic
│   ├── base.processor.ts          # Abstract base class for all processors
│   ├── contract.processor.ts      # Contract processing (with chunking/embeddings)
│   ├── fuel-bid.processor.ts      # Fuel bid processing
│   ├── quote.processor.ts         # Quote processing
│   ├── rfq.processor.ts           # RFQ processing
│   └── index.ts                   # Processor exports
│
├── extraction/                    # File processing & extraction orchestration
│   ├── files.server.ts            # Server-side processing orchestration
│   ├── files.client.ts            # Client-side processing utilities
│   ├── files.types.ts             # TypeScript type definitions
│   └── index.ts                   # Extraction module exports
│
├── workflows/                     # High-level orchestration workflows
│   ├── orchestrator.client.ts     # Client-side workflow operations
│   ├── orchestrator.types.ts      # Workflow type definitions
│   └── index.ts                   # Workflow exports
│
├── index.ts                       # Main module exports
└── README.md                      # This file
```

---

## 🎯 Module Overview

### Storage (`storage/`)

**What it does:** Cloud storage operations (provider-agnostic, currently Supabase)

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

### Documents (`documents/`)

**What it does:** PostgreSQL document record management (metadata + extracted data)

**Key functions:**

- `createDocument()` - Create new document record
- `updateDocument()` - Update document metadata/extracted data
- `deleteDocument()` - Delete document record
- `deleteDocumentCascade()` - Delete document and associated storage file
- `getDocumentById()` - Fetch single document
- `listDocumentsByContract()` - List documents for a contract

**Notes:**

- Documents are PostgreSQL records, not physical files
- Storage path links document record to physical file
- Extracted data stored as JSONB in database

---

### Chunks (`chunks/`)

**What it does:** Document chunking for RAG (Retrieval-Augmented Generation) and semantic search

**Key functions:**

- `createDocumentChunks()` - Split document content into searchable chunks with embeddings

**Notes:**

- Used primarily for contracts and other searchable documents
- Creates vector embeddings for semantic search
- Stored in PostgreSQL with pgvector extension

---

### Processors (`processors/`)

**What it does:** Document type-specific processing pipelines

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

### Extraction (`extraction/`)

**What it does:** File processing orchestration and extraction coordination

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

### Workflows (`workflows/`)

**What it does:** Client-side orchestration of complex file processing operations with optional job tracking

**Key functions:**

- `processDocument()` - Complete document workflow with job tracking and status updates

**Features:**

- Optional job tracking for user-facing operations
- Real-time status indicator updates
- Automatic error handling and recovery
- Progress callbacks for custom UI updates
- Coordinates file-manager, jobs system, and status store

**How it works:**

1. Creates a tracking job (if enabled)
2. Updates global status indicator
3. Calls file-manager API to process file
4. Polls job for progress updates
5. Updates status indicator in real-time
6. Returns processing result with documentId

**Use cases:**

- User-initiated file uploads requiring progress tracking
- Document processing with status feedback
- Complex workflows requiring coordination between multiple systems

---

## 💻 Usage Examples

### Storage Operations

```typescript
import { storage } from '@/modules/file-manager';

// Server-side
const result = await storage.server.uploadFile(file, 'contract', contractId);
await storage.server.deleteFile('contracts/example.pdf');
const { signedUrl } = await storage.server.createSignedUrl(orgId, path, 3600);

// Client-side
await storage.client.uploadFile(file, 'contract');
const url = await storage.client.getSignedUrl(path);
```

### File Processing & Extraction

```typescript
import { extraction } from '@/modules/file-manager';

// Server-side
const result = await extraction.server.processFile({
  file,
  documentType: 'contract',
  parentId: contractId,
  orgId,
  userId,
});

// Client-side
const result = await extraction.client.uploadAndProcessFile(file, {
  documentType: 'contract',
  parentId: contractId,
  onProgress: (progress) => console.log(`${progress}%`),
});
```

### Document Management

```typescript
import { documents } from '@/modules/file-manager';

// Server-side
const doc = await documents.server.createDocument({
  parentId: contractId,
  parentType: 'contract',
  fileName: 'contract.pdf',
  fileSize: 1024,
  fileType: 'application/pdf',
});

await documents.server.deleteDocumentCascade(doc.id, doc.storagePath);

// Client-side
const doc = await documents.client.getDocumentById(docId);
const allDocs = await documents.client.listDocumentsByContract(contractId);
```

### Workflows (Client-Side Orchestration)

```typescript
import { workflows } from '@/modules/file-manager';

// Complete document processing workflow with job tracking
const result = await workflows.client.processDocument(file, {
  parentId: contractId,
  parentType: 'contract',
  trackProgress: true, // Enable job tracking and status indicator updates (default: true)
  onProgress: (progress, message) => {
    console.log(`${progress}%: ${message}`);
    // Optional: Update custom UI components
  },
});

// Result contains:
// - success: boolean
// - documentId?: string
// - extractedData?: any
// - error?: string

if (result.success && result.documentId) {
  console.log('Document processed successfully:', result.documentId);
} else {
  console.error('Processing failed:', result.error);
}
```

**Processing without job tracking:**

```typescript
// For background operations or non-user-facing tasks
const result = await workflows.client.processDocument(file, {
  parentId: contractId,
  parentType: 'contract',
  trackProgress: false, // Disable job tracking
});
```

### Type Imports

```typescript
import type {
  FileUploadOptions,
  FileProcessingRequest,
  ProcessorConfig,
  DocumentCreateInput,
} from '@/modules/file-manager';
```

---

## 🔄 Processing Pipeline

### Client-Side Workflow (Recommended)

For user-facing file uploads, use the workflow orchestrator:

```typescript
workflows.client.processDocument(file, options)
  ├── 1. Create tracking job (optional)
  ├── 2. Update status indicator
  ├── 3. Call /api/file-manager/process
  ├── 4. Poll job for updates
  ├── 5. Update status indicator during processing
  └── 6. Return result + handle completion/errors
```

### Server-Side Processing

Standard flow for all document types (executed by processors):

1. **Validate** → Check file type, size, custom rules
2. **Create Document** → Insert DB record with pending status
3. **Upload to Storage** → Save file to Supabase bucket
4. **Parse & Extract** → Run parser + extraction agent (parallel)
5. **Transform** → Document-specific data transformation
6. **Update Document** → Save extracted data to DB
7. **Chunk & Embed** → Create searchable chunks (if configured)

Each processor can customize steps 5-7.

**Progress Updates:**

If a jobId is provided, the processor updates the job at each step:

- Step 1-2: 10% - "Creating document record..."
- Step 3: 30% - "Uploading to storage..."
- Step 4: 50% - "Extracting document data..."
- Step 5-6: 80% - "Saving extracted data..."
- Step 7: 95% - "Creating searchable chunks..."
- Complete: 100% - "Document processed successfully"

---

## 🔑 Key Concepts

**Naming Conventions:**

- `storage` → Cloud file storage (binary files, provider-agnostic)
- `documents` → PostgreSQL records (metadata + extracted data)
- `chunks` → Text chunks with embeddings for semantic search
- `processors` → Document type-specific business logic
- `extraction` → File processing & extraction orchestration
- `workflows` → High-level multi-step workflows

**API Routes:**

- `/api/file-manager/storage/*` → Storage operations (upload, download, delete, list, sign)
- `/api/file-manager/process` → Unified document processing endpoint (with optional job tracking)
- `/api/file-manager/documents/*` → Document CRUD operations
- `/api/file-manager/chunks/*` → Chunk creation and management
- `/api/jobs` → Generic job tracking for async operations (used by workflows)

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
4. Register processor in `core/files.server.ts` registry

---

## 🏗️ Architecture Principles

### Separation of Concerns

- **Storage** = Physical files (Supabase)
- **Documents** = Database records (PostgreSQL)
- **Chunks** = Searchable fragments (with embeddings)
- **Processors** = Business logic (document-specific)
- **Core** = Coordination (orchestration)

### Single Responsibility

- Each module has one clear purpose
- No overlapping concerns
- Easy to maintain and extend

### Type Safety

- Full TypeScript support
- Shared types across client/server
- Type inference where possible

### Testability

- Small, focused functions
- Clear dependencies
- Easy to mock and test

---

## ✅ Benefits

- **Single Module** - All file operations in one place
- **Consistent API** - Same pattern for all document types
- **Type-Safe** - Full TypeScript support
- **Scalable** - Easy to add new document types
- **Maintainable** - DRY principle, shared base logic
- **Performant** - Optimized with parallel operations
- **Well-Organized** - Clear separation of concerns
- **Progress Tracking** - Optional job tracking with status updates
- **Flexible** - Works with or without job tracking
- **User-Friendly** - Real-time feedback through status indicator
- **Documented** - Comprehensive documentation and examples

---

## 🔧 Migration Notes

### Migrating from Old Structure

**Old imports:**

```typescript
import { storage } from '@/modules/files';
import { server as documentsServer } from '@/modules/documents/documents';
import { processDocument } from '@/modules/documents/orchastration';
```

**New imports:**

```typescript
import { storage, documents, extraction, workflows } from '@/modules/file-manager';
```

**Note:** Naming improvements - `orchastration` → `workflows`, `core` → `extraction`

### Migrating from Direct /api/jobs Calls

**Old approach (tightly coupled):**

```typescript
// Create FormData and call /api/jobs directly
const formData = new FormData();
formData.append('file', file);
formData.append('documentType', 'contract');
formData.append('parentId', contractId);

const res = await fetch('/api/jobs', {
  method: 'POST',
  body: formData,
});

const { jobId } = await res.json();

// Manual polling logic
while (true) {
  const statusRes = await fetch(`/api/jobs/${jobId}`);
  const status = await statusRes.json();

  // Manual status indicator updates
  updateGlobalStatus(status.status, status.message, status.progress);

  if (status.status === 'completed' || status.status === 'error') {
    break;
  }

  await new Promise((r) => setTimeout(r, 1000));
}
```

**New approach (decoupled):**

```typescript
// Use workflow orchestrator
import { workflows } from '@/modules/file-manager';

const result = await workflows.client.processDocument(file, {
  parentId: contractId,
  parentType: 'contract',
  trackProgress: true,
});

// That's it! Workflow handles:
// - Job creation
// - Status indicator updates
// - Polling
// - Error handling
// - Completion
```

**Benefits of new approach:**

- 70% less code in components
- Automatic status indicator management
- Consistent error handling
- Progress tracking is optional
- Reusable across all document types

---

## 📞 Support

For questions or issues, please refer to the main project documentation or contact the development team.
