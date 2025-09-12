# Storage and Documents Management Architecture

This document outlines the comprehensive file storage and document management system used in Fleet AI, covering the flow from file upload to document organization and retrieval.

## System Overview

The system consists of two main components:

- **Storage Module**: Handles physical file storage operations with Supabase Storage
- **Documents Module**: Manages document metadata and relationships in the database

## File Storage Architecture

### Storage Structure

```
Organization Bucket (slugified org name)
├── contracts/
├── invoices/
├── fuel_tender/
├── fuel_bid/
├── rfq/
└── other/
```

### Upload Process Flow

1. **File Upload to Supabase Storage**
   - Endpoint: `POST /api/storage/upload`
   - Organization-based bucket naming: `slugify(org.name)`
   - File path structure: `{documentType}/{fileName-uuid}.{ext}`
   - Returns storage metadata:

   ```json
   {
     "data": {
       "path": "contracts/contract-name-1a2b.pdf",
       "fullPath": "my-org/contracts/contract-name-1a2b.pdf"
     },
     "bucket": "my-org",
     "originalName": "Contract Name.pdf",
     "size": 1024576,
     "contentType": "application/pdf"
   }
   ```

2. **Document Record Creation**
   - Create entry in `documentsTable` with metadata
   - Links storage path to database record
   - Establishes parent-child relationships

## Documents Database Schema

### Documents Table Structure

```sql
documents {
  id: uuid (PK)
  orgId: uuid (FK -> organizations)

  -- Polymorphic relationship
  parentId: uuid              -- Generic FK to parent entity
  parentType: enum            -- Type of parent entity

  -- File metadata
  fileType: text              -- File extension/type
  storageUrl: text            -- Public URL (if applicable)
  storagePath: text           -- Path in storage bucket
  content: text               -- Extracted text content

  -- Timestamps
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Parent Type Relationships

Documents support polymorphic relationships with multiple entity types:

| Parent Type   | Description                      | Example Use Case                       |
| ------------- | -------------------------------- | -------------------------------------- |
| `contract`    | Legal contracts and agreements   | Service agreements, vendor contracts   |
| `invoice`     | Vendor invoices and billing      | Payment documents, receipts            |
| `rfq`         | Request for Quote documents      | Technical specifications, requirements |
| `fuel_tender` | Fuel tender documentation        | Bid documents, terms                   |
| `fuel_bid`    | Fuel bid submissions             | Vendor responses, proposals            |
| `other`       | General organizational documents | Miscellaneous files                    |

## API Operations

### Storage Operations

#### Upload File

```typescript
// Client
uploadFile(file: File, documentType: string)
// Returns: StorageResponse with path and metadata
```

#### Download File

```typescript
// Client
downloadFile(path: string, bucket: string)
// Returns: File blob
```

#### Delete File

```typescript
// Client
deleteFile(path: string)
// Returns: Success confirmation
```

#### List Files

```typescript
// Client
listFilesByBucket(bucket: string, folder?: string, search?: string, limit?: number, offset?: number)
// Returns: Array of file metadata
```

### Document Operations

#### Create Document

```typescript
// Client
createDocument(data: DocumentCreateInput)
// Server
createDocument(document: NewDocument)
```

#### Retrieve Documents

```typescript
// Client
listDocumentsByContract(contractId: string)
getDocumentById(id: string)
```

#### Update Document

```typescript
// Client
updateDocument(id: string, data: DocumentUpdateInput)
// Server
updateDocument(document: Document)
```

#### Delete Document

```typescript
// Server
deleteDocument(documentId: string)
```

## Integration with AI/Embeddings

Documents integrate with the AI system through the embeddings table:

```sql
embeddings {
  id: uuid (PK)
  orgId: uuid (FK -> organizations)
  documentId: uuid (FK -> documents)

  order: integer              -- Sequence within document
  label: text                 -- Semantic label ("Pricing", "SLA")
  content: text               -- Chunk content
  embedding: vector(1536)     -- OpenAI embedding
  meta: jsonb                 -- Metadata (page, tokens, etc.)
}
```

## Security and Access Control

### Authorization

- All operations require valid organization membership
- Users can only access documents within their organization
- Bucket access is organization-scoped

### File Storage Security

- Organization-based bucket isolation
- Unique file naming prevents collisions
- Content-type validation on upload
- Path sanitization and validation

## Usage Examples

### Complete Upload Flow

```typescript
// 1. Upload file to storage
const storageResult = await uploadFile(file, 'contracts');

// 2. Create document record
const document = await createDocument({
  parentId: contractId,
  parentType: 'contract',
  fileType: file.type,
  storagePath: storageResult.data.fullPath,
  storageUrl: storageResult.publicUrl, // if applicable
});

// 3. Document is now available for retrieval and AI processing
```

### Retrieving Contract Documents

```typescript
// Get all documents for a contract
const documents = await listDocumentsByContract(contractId);

// Download a specific document
const fileBlob = await downloadFile(document.storagePath, bucket);
```

## Error Handling

### Storage Errors

- File upload failures return detailed Supabase error messages
- Bucket access errors indicate authorization issues
- File not found errors for invalid paths

### Document Errors

- Validation errors for missing required fields
- Foreign key constraint errors for invalid parent relationships
- Organization access control violations

## Performance Considerations

### File Operations

- Files are cached with 1-hour cache control
- Large file uploads use multipart form data
- File listing supports pagination (limit/offset)

### Database Queries

- Indexed queries on `parentId/parentType` combinations
- Organization-scoped queries for security and performance
- Efficient joins with parent entities through polymorphic relationships

## Future Enhancements

- [ ] File versioning support
- [ ] Bulk upload operations
- [ ] Advanced search and filtering
- [ ] Automated content extraction pipeline
- [ ] Document approval workflows
