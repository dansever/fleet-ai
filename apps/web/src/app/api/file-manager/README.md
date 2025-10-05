# File Manager API

**Purpose:** Unified API endpoints for all file and document management operations in FleetAI.

---

## 📁 API Structure

```
api/file-manager/
├── storage/                    # Cloud storage operations
│   ├── upload/                # POST - Upload file to cloud storage
│   ├── download/              # GET - Download file from storage
│   ├── delete/                # DELETE - Delete file from storage
│   ├── list/                  # GET - List files by document type
│   └── sign/                  # POST - Generate signed URL for file access
│
├── documents/                 # Document records (database operations)
│   ├── [id]/                 # GET/PUT/DELETE - Single document operations
│   ├── create/               # POST - Create new document record
│   └── list/                 # GET - List documents by contract
│
├── chunks/                    # Document chunking for RAG/search
│   └── [documentId]/         # POST - Create chunks for document
│
├── process/                   # File processing pipeline
│   └── route.ts              # POST - Process file (extract, chunk, etc.)
│
└── files/                     # Legacy file operations (deprecated)
    └── [id]/                 # DELETE - Legacy file deletion
```

---

## 🔗 Endpoint Reference

### Storage Operations

#### `POST /api/file-manager/storage/upload`

Upload a file to cloud storage.

**Request:**

```typescript
FormData {
  file: File;
  documentType: string;
}
```

**Response:**

```typescript
{
  id: string;
  path: string;
  fullPath: string;
}
```

#### `GET /api/file-manager/storage/download?path={path}`

Download a file from storage.

**Parameters:**

- `path` (query) - Storage path to file

**Response:** File blob

#### `DELETE /api/file-manager/storage/delete`

Delete a file from storage.

**Request:**

```typescript
{
  path: string;
}
```

#### `GET /api/file-manager/storage/list?documentType={type}`

List files by document type.

**Parameters:**

- `documentType` (query) - Document type to filter by

**Response:**

```typescript
Array<{
  name: string;
  path: string;
  createdAt: string;
  size: number | null;
}>;
```

#### `POST /api/file-manager/storage/sign`

Generate a signed URL for file access.

**Request:**

```typescript
{
  path: string;
  expiresIn?: number; // Default: 60 seconds
}
```

**Response:**

```typescript
{
  signedUrl: string;
}
```

---

### Document Operations

#### `GET /api/file-manager/documents/{id}`

Get a document by ID.

**Response:**

```typescript
Document; // Full document object with metadata
```

#### `PUT /api/file-manager/documents/{id}`

Update a document.

**Request:**

```typescript
DocumentUpdateInput; // Partial document fields
```

**Response:**

```typescript
Document; // Updated document
```

#### `DELETE /api/file-manager/documents/{id}`

Delete a document and its storage file.

**Request:**

```typescript
{
  storagePath?: string;
}
```

#### `POST /api/file-manager/documents/create`

Create a new document record.

**Request:**

```typescript
DocumentCreateInput; // Document fields excluding auto-generated ones
```

**Response:**

```typescript
Document; // Created document
```

#### `GET /api/file-manager/documents/list/{contractId}`

List documents for a specific contract.

**Response:**

```typescript
Document[] // Array of documents
```

---

### Processing Operations

#### `POST /api/file-manager/process`

Process a file through the complete pipeline (upload, extract, chunk, etc.).

**Request:**

```typescript
FormData {
  file: File;
  documentType: DocumentType;
  parentId: string;
}
```

**Response:**

```typescript
{
  success: boolean;
  documentId?: string;
  extractedData?: Record<string, any>;
  error?: string;
  metadata?: {
    fileSize: number;
    fileName: string;
    processingTime: number;
    extractionAgent: string;
  };
}
```

---

### Chunking Operations

#### `POST /api/file-manager/chunks/{documentId}`

Create chunks for a document (for RAG/search).

**Request:**

```typescript
{
} // Empty body
```

**Response:**

```typescript
{
  ok: boolean;
  inserted?: number;
  documentId?: string;
  error?: string;
}
```

---

## 💻 Usage Examples

### Upload and Process File

```typescript
// Upload file and trigger processing
const formData = new FormData();
formData.append('file', file);
formData.append('documentType', 'contract');
formData.append('parentId', contractId);

const response = await fetch('/api/file-manager/process', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
```

### Get Document with Signed URL

```typescript
// Get document
const document = await fetch(`/api/file-manager/documents/${docId}`);

// Generate signed URL for file access
const signResponse = await fetch('/api/file-manager/storage/sign', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    path: document.storagePath,
    expiresIn: 3600, // 1 hour
  }),
});

const { signedUrl } = await signResponse.json();
```

### List and Download Files

```typescript
// List files by document type
const files = await fetch('/api/file-manager/storage/list?documentType=contract');

// Download specific file
const fileBlob = await fetch(`/api/file-manager/storage/download?path=${filePath}`);
```

---

## 🔄 Migration from Old Endpoints

### Old → New Endpoint Mapping

| Old Endpoint         | New Endpoint                    | Status        |
| -------------------- | ------------------------------- | ------------- |
| `/api/storage/*`     | `/api/file-manager/storage/*`   | ✅ Migrated   |
| `/api/documents/*`   | `/api/file-manager/documents/*` | ✅ Migrated   |
| `/api/files/process` | `/api/file-manager/process`     | ✅ Migrated   |
| `/api/chunks/*`      | `/api/file-manager/chunks/*`    | ✅ Migrated   |
| `/api/files/[id]`    | `/api/file-manager/files/[id]`  | ⚠️ Deprecated |

### Deprecation Headers

Legacy endpoints include deprecation headers:

```
Deprecation: true
Sunset: Wed, 01 Jan 2026 00:00:00 GMT
Link: </api/file-manager/documents/{id}>; rel="successor-version"
```

---

## 🔐 Authentication & Authorization

All endpoints require:

- Valid Clerk authentication
- Organization membership
- Resource-level permissions (users can only access their org's data)

**Error Responses:**

- `401 Unauthorized` - Invalid or missing authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource doesn't exist or not accessible

---

## 🏗️ Architecture Benefits

### Domain Organization

- **Clear separation** - File operations grouped by function
- **Consistent patterns** - Same structure across all endpoints
- **Scalable design** - Easy to add new file operations

### Developer Experience

- **Self-documenting** - Endpoint names describe their function
- **Type-safe** - Full TypeScript support
- **Predictable** - Consistent request/response patterns

### Maintainability

- **Single responsibility** - Each endpoint has one clear purpose
- **Easy testing** - Isolated, focused endpoints
- **Clear dependencies** - Obvious relationships between operations

---

## 📞 Support

For questions about the File Manager API:

1. Check the main [File Manager Module documentation](../../modules/file-manager/README.md)
2. Review the endpoint examples above
3. Contact the development team for additional support
