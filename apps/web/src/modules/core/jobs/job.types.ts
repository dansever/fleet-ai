/**
 * Job Management Types
 * Defines the structure for tracking async jobs in the system
 */

export type JobStatus = 'queued' | 'processing' | 'completed' | 'error';

export interface JobState {
  jobId: string;
  status: JobStatus;
  message: string;
  progress?: number; // 0-100
  timestamp: string; // ISO string
  documentId?: string; // Set when processing completes successfully
  error?: string; // Error details if status is 'error'
  metadata?: Record<string, any>; // Additional context
}

export interface CreateJobOptions {
  message?: string;
  metadata?: Record<string, any>;
}

export interface UpdateJobOptions {
  status?: JobStatus;
  message?: string;
  progress?: number;
  documentId?: string;
  error?: string;
  metadata?: Record<string, any>;
}
