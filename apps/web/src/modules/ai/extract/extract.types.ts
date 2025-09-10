// Types for document extraction using LlamaExtract

export interface ExtractionUsage {
  num_pages_extracted: number;
  num_document_tokens: number;
  num_output_tokens: number;
}

export interface ExtractionMetadata {
  field_metadata: Record<string, any>;
  usage: ExtractionUsage;
}

export interface ExtractionResult {
  run_id: string;
  extraction_agent_id: string;
  data: Record<string, any>;
  extraction_metadata: ExtractionMetadata;
}

export interface ExtractionState {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  fileId?: string;
  jobId?: string;
  agentId?: string;
  result?: ExtractionResult;
  error?: string;
  fileName?: string;
  progress?: number;
}

export interface ExtractionAgent {
  id: string;
  name: string;
  data_schema: Record<string, any>;
  config: Record<string, any>;
}

export interface ExtractionJob {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  file_id: string;
  extraction_agent_id: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  mime_type: string;
}
