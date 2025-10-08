/**
 * Job Management Types
 * Defines the structure for tracking async jobs in the system
 */

export type JobStatus = 'queued' | 'processing' | 'completed' | 'error';

/**
 * Job types for different async operations in the system
 */
export type JobType =
  | 'file_processing' // File upload and document extraction
  | 'document_analysis' // Document analysis and insights
  | 'llm_agent' // LLM agent operations
  | 'generic'; // Generic async operations

export interface JobState {
  jobId: string;
  jobType: JobType;
  status: JobStatus;
  message: string;
  progress?: number; // 0-100
  timestamp: string; // ISO string
  documentId?: string; // Set when processing completes successfully
  error?: string; // Error details if status is 'error'
  metadata?: Record<string, any>; // Additional context
}

export interface CreateJobOptions {
  jobId?: string; // Optional: provide specific jobId (for serverless instance sync)
  jobType?: JobType;
  message?: string;
  metadata?: Record<string, any>;
}

export interface UpdateJobOptions {
  jobType?: JobType;
  status?: JobStatus;
  message?: string;
  progress?: number;
  documentId?: string;
  error?: string;
  metadata?: Record<string, any>;
}
