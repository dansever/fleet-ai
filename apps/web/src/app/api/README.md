# FleetAI API Structure

This directory contains the API routes organized by business logic domains.

---

## 🏗️ Current API Organization

### `/api/file-manager/` - File & Document Management

**NEW!** Unified module for all file operations.

- **`storage/`** - Cloud storage operations (upload, download, delete, list, sign URLs)
- **`documents/`** - Document records (database operations)
- **`chunks/`** - Document chunking for RAG/search
- **`process/`** - File processing pipeline (extract, transform, etc.)
- **`files/`** - Legacy file operations (deprecated)

**See:** [`/file-manager/README.md`](./file-manager/README.md) for detailed documentation.

---

### `/api/ai/` - AI Operations

- **`chat/`** - Conversational AI functionality
- **`extract/`** - Document extraction agents
- **`parse/`** - Document parsing
- **`convert/`** - Unit conversion utilities

---

### `/api/business/` - Business Logic Domains

- **`contracts/`** - Contract management
- **`fuel/`** - Fuel operations (bids, tenders)
- **`quotes/`** - Vendor quotes
- **`rfqs/`** - Request for quotes
- **`invoices/`** - Invoice management
- **`vendors/`** - Vendor management

---

### `/api/core/` - Core System Operations

- **`airports/`** - Airport data
- **`organizations/`** - Organization management
- **`users/`** - User management
- **`health/`** - System health checks

---

### `/api/admin/` - Administrative Operations

- **`extractors/`** - AI extraction agent management
- **`storage/`** - Storage bucket management

---

## 🔄 Migration Status

### ✅ Completed Migrations

**File Manager Module:**

- ✅ `/api/storage/*` → `/api/file-manager/storage/*`
- ✅ `/api/documents/*` → `/api/file-manager/documents/*`
- ✅ `/api/files/process` → `/api/file-manager/process`
- ✅ `/api/chunks/*` → `/api/file-manager/chunks/*`

### ⚠️ Deprecated Endpoints

These endpoints still work but include deprecation headers:

- `/api/files/[id]` → Use `/api/file-manager/documents/[id]` instead

---

## 📋 Future API Reorganization

### Planned Structure

```
api/
├── file-manager/          ✅ COMPLETED
│   ├── storage/
│   ├── documents/
│   ├── chunks/
│   └── process/
│
├── ai/                    🔄 NEXT PHASE
│   ├── chat/
│   ├── extract/
│   ├── parse/
│   └── convert/
│
├── business/              📋 PLANNED
│   ├── contracts/
│   ├── fuel/
│   ├── quotes/
│   ├── rfqs/
│   ├── invoices/
│   └── vendors/
│
├── core/                  📋 PLANNED
│   ├── airports/
│   ├── organizations/
│   ├── users/
│   └── health/
│
└── admin/                 📋 PLANNED
    ├── extractors/
    └── storage/
```

---

## 💻 Usage Examples

### File Manager API

```typescript
// Process a file through the complete pipeline
const formData = new FormData();
formData.append('file', file);
formData.append('documentType', 'contract');
formData.append('parentId', contractId);

const response = await fetch('/api/file-manager/process', {
  method: 'POST',
  body: formData,
});

// Get document with signed URL
const document = await fetch(`/api/file-manager/documents/${docId}`);
const { signedUrl } = await fetch('/api/file-manager/storage/sign', {
  method: 'POST',
  body: JSON.stringify({ path: document.storagePath }),
});
```

### Business Logic APIs

```typescript
// Create a new contract
const contract = await fetch('/api/business/contracts', {
  method: 'POST',
  body: JSON.stringify(contractData),
});

// Get fuel bids
const bids = await fetch('/api/business/fuel/bids');
```

---

## 🎯 Benefits of This Structure

### 1. **Domain-Driven Organization**

- Related endpoints grouped together
- Clear separation of concerns
- Easy to find relevant APIs

### 2. **Consistent Patterns**

- Same structure across all domains
- Predictable endpoint naming
- Standardized request/response formats

### 3. **Scalability**

- Easy to add new domains
- No namespace conflicts
- Independent development possible

### 4. **Developer Experience**

- Self-documenting endpoint names
- Clear API boundaries
- Comprehensive documentation

### 5. **Maintainability**

- Single responsibility per endpoint
- Easy to test and debug
- Clear dependencies

---

## 🔧 Development Guidelines

### Adding New Endpoints

1. **Choose the right domain** - Where does this functionality belong?
2. **Follow the pattern** - Use consistent naming and structure
3. **Document thoroughly** - Include examples and type definitions
4. **Test comprehensively** - Ensure proper error handling

### Migration Strategy

1. **Create new endpoints** in the target domain
2. **Update client code** to use new endpoints
3. **Add deprecation headers** to old endpoints
4. **Monitor usage** and remove old endpoints when safe

---

## 📞 Support

- **File Manager APIs:** See [`/file-manager/README.md`](./file-manager/README.md)
- **General questions:** Contact the development team
- **Bug reports:** Use the project issue tracker
