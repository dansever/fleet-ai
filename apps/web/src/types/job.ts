export type JobStatus = 'idle' | 'queued' | 'processing' | 'analyzing' | 'completed' | 'error';

export interface JobState {
  status: JobStatus;
  message: string;
  progress?: number; // 0-100
  timestamp: string; // ISO string for easy serialize
  jobId?: string; // optional, when tracking a specific background job
}
