# Airport Hub Components

This directory contains all components related to the Airport Hub feature, organized by responsibility.

## Directory Structure

```
_components/
├── contract/              # Contract-level components
│   ├── ContractOverview.tsx   # Overview tab showing contract details
│   └── ContractSidebar.tsx    # Sidebar listing all contracts
├── documents/             # Document-level components
│   └── ContractDocuments.tsx  # Document management and viewer
└── README.md
```

## Component Responsibilities

### Contract-Level Components (`contract/`)

These components manage **entire contracts**. Actions here affect the whole contract entity.

#### ContractOverview.tsx

- **Purpose**: Displays comprehensive contract information
- **Features**:
  - Contract details (dates, vendor info, terms)
  - Contract-level actions (View, Edit)
  - **DANGER ZONE**: Delete entire contract (red "danger" button)
- **Delete Action**: Permanently deletes the contract AND all associated documents
- **Visual Cues**:
  - Blue information banner explaining contract-level scope
  - Separated "Danger Zone" section for destructive actions
  - Red "danger" intent button for delete action

#### ContractSidebar.tsx

- **Purpose**: Lists all contracts for the selected airport
- **Features**:
  - Filterable/searchable contract list
  - Status badges (active, pending, inactive)
  - Quick add new contract button
  - Auto-select newly created contracts

### Document-Level Components (`documents/`)

These components manage **individual documents** within a contract. Actions here only affect specific files.

#### ContractDocuments.tsx

- **Purpose**: Document upload, viewing, and management
- **Features**:
  - Document list sidebar
  - Document viewer with tabs (Summary, Extracted Data, Content)
  - AI-powered insights and analysis
  - Document-level actions (Download, Delete)
- **Delete Action**: Only deletes the specific document file, NOT the contract
- **Visual Cues**:
  - Amber warning banner explaining document-level scope
  - Clear labeling: "Delete File" vs "Delete Contract"
  - Secondary intent button (not danger) for file deletion

## UI/UX Improvements

### 1. Clear Visual Distinction

**Contract-Level (Overview Tab)**:

- 🔵 Blue information banner
- 🔴 Red "Danger Zone" section
- 🗑️ "Delete Contract" button (danger intent)
- ⚠️ Confirmation: "Delete entire contract and all documents"

**Document-Level (Files Tab)**:

- 🟡 Amber warning banner
- 🗑️ "Delete File" button (secondary intent)
- ⚠️ Confirmation: "Delete only this document file"

### 2. Consistent Naming

- `ContractOverview` → Contract-level overview
- `ContractSidebar` → Contract list
- `ContractDocuments` → Document management (plural, manages multiple documents)

### 3. Improved Confirmations

Delete confirmations now explicitly state:

- **Contract deletion**: "Delete entire contract including all documents"
- **Document deletion**: "Delete only this file, not the contract"

## Usage Examples

### Importing Contract Components

```tsx
// Import contract-level components
import { ContractOverview } from './_components/contract/ContractOverview';
import ContractSidebar from './_components/contract/ContractSidebar';

// Use in tabs
<TabsContent value="overview">
  <ContractOverview />
</TabsContent>;
```

### Importing Document Components

```tsx
// Import document-level components
import { ContractDocuments } from './_components/documents/ContractDocuments';

// Use in tabs
<TabsContent value="files">
  <ContractDocuments />
</TabsContent>;
```

## Key Improvements from Previous Structure

### Before:

- ❌ Confusing: Same "Delete" button label in different contexts
- ❌ Unclear: `ContractFiles.tsx` exported `ContractDocument` (naming mismatch)
- ❌ Dangerous: No visual distinction between delete actions
- ❌ Flat structure: All components in one directory

### After:

- ✅ Clear: Explicit labels ("Delete Contract" vs "Delete File")
- ✅ Consistent: `ContractDocuments.tsx` exports `ContractDocuments`
- ✅ Safe: Visual cues, color coding, and danger zones
- ✅ Organized: Components grouped by responsibility

## Related Documentation

- Contract management flow: `/features/contracts/`
- Document processing: `/modules/file-manager/`
- AI extraction: `/modules/ai/parse/`

## Contributing

When adding new components:

1. **Determine scope**: Contract-level or document-level?
2. **Place appropriately**: `contract/` or `documents/` directory
3. **Follow naming**: Be explicit and consistent
4. **Add visual cues**: Use info banners for context
5. **Destructive actions**: Always use danger intent and clear confirmations
6. **Update this README**: Document new components and their purpose
