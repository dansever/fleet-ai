# File Upload Business Logic Hooks

This directory contains separated business logic hooks for the file upload feature, following single responsibility principles.

## Architecture Overview

The file upload process has been separated into distinct business concerns:

### 1. **useFileUpload** - File Storage Logic

- Handles uploading files to storage systems (Supabase, S3, etc.)
- Manages upload progress and error states
- Provides upload status and file metadata

### 2. **useDocumentExtraction** - AI Extraction Logic

- Handles document extraction using LlamaExtract API
- Manages extraction job lifecycle (start, poll, complete)
- Provides extraction results and metadata

### 3. **useProgressAnimation** - UI Progress Logic

- Manages gradual progress animation (2% every 0.5s until 85%)
- Handles smooth completion animation (85% → 100%)
- Provides progress callbacks for UI updates

### 4. **useFileProcessing** - Main Orchestrator

- Coordinates all business logic hooks
- Provides single entry point for file processing
- Manages overall state and workflow

## Usage

### Simple Usage (Recommended)

```tsx
import { useFileProcessing } from './hooks';

function MyComponent() {
  const { state, processFile, reset } = useFileProcessing({
    userId: 'user123',
    orgId: 'org456',
    enableStorage: false, // Direct extraction
  });

  const handleUpload = async (file: File) => {
    await processFile(file);
  };

  return (
    <div>
      {state.status === 'processing' && <progress value={state.progress} max="100" />}
      {state.status === 'completed' && <pre>{JSON.stringify(state.extractionResult, null, 2)}</pre>}
    </div>
  );
}
```

### Advanced Usage (Custom Logic)

```tsx
import { useFileUpload, useDocumentExtraction, useProgressAnimation } from './hooks';

function CustomComponent() {
  // Use individual hooks for custom workflows
  const fileUpload = useFileUpload({ bucket: 'documents' });
  const extraction = useDocumentExtraction({ userId, orgId });
  const progress = useProgressAnimation(options, onProgress);

  // Custom orchestration logic...
}
```

## Business Logic Separation

### File Upload Flow

1. **File Selection** → FileUpload component
2. **Storage Upload** → useFileUpload hook (optional)
3. **Document Extraction** → useDocumentExtraction hook
4. **Progress Animation** → useProgressAnimation hook
5. **Result Display** → UI components

### Configuration Options

#### Storage Integration

```tsx
const { state, processFile } = useFileProcessing({
  userId,
  orgId,
  enableStorage: true, // Upload to storage first
  storageBucket: 'documents', // Storage bucket name
});
```

#### Progress Animation

```tsx
const progressAnimation = useProgressAnimation(
  {
    increment: 2, // 2% per step
    interval: 500, // 0.5 seconds
    maxProgress: 85, // Stop at 85%
  },
  onProgressCallback,
);
```

## Benefits

1. **Single Responsibility** - Each hook handles one business concern
2. **Reusability** - Hooks can be used independently in other components
3. **Testability** - Business logic is isolated and easily testable
4. **Maintainability** - Clear separation makes code easier to understand and modify
5. **Flexibility** - Easy to swap implementations or add new features

## File Structure

```
hooks/
├── index.ts                 # Main exports
├── useFileProcessing.ts     # Main orchestrator
├── useFileUpload.ts         # Storage upload logic
├── useDocumentExtraction.ts # AI extraction logic
├── useProgressAnimation.ts  # Progress animation logic
└── README.md               # This documentation
```
