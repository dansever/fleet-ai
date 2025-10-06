/**
 * Job Manager
 * In-memory job state management with automatic cleanup
 */

import { CreateJobOptions, JobState, UpdateJobOptions } from './job.types';

// In-memory job store
const jobs = new Map<string, JobState>();

// Cleanup completed/error jobs after 5 minutes
const CLEANUP_DELAY = 5 * 60 * 1000;

/**
 * Generate a unique job ID
 */
function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Schedule job cleanup after delay
 */
function scheduleCleanup(jobId: string) {
  setTimeout(() => {
    const job = jobs.get(jobId);
    if (job && (job.status === 'completed' || job.status === 'error')) {
      jobs.delete(jobId);
      console.log(`🗑️ Cleaned up job: ${jobId}`);
    }
  }, CLEANUP_DELAY);
}

/**
 * Create a new job
 */
export function createJob(options: CreateJobOptions = {}): JobState {
  const jobId = generateJobId();
  const job: JobState = {
    jobId,
    status: 'queued',
    message: options.message || 'Job created',
    timestamp: new Date().toISOString(),
    metadata: options.metadata,
  };

  jobs.set(jobId, job);
  console.log(`✨ Created job: ${jobId}`);
  return job;
}

/**
 * Get a job by ID
 */
export function getJob(jobId: string): JobState | undefined {
  return jobs.get(jobId);
}

/**
 * Update a job's state
 */
export function updateJob(jobId: string, updates: UpdateJobOptions): JobState | undefined {
  const job = jobs.get(jobId);
  if (!job) {
    console.warn(`⚠️ Job not found: ${jobId}`);
    return undefined;
  }

  // Merge updates
  const updatedJob: JobState = {
    ...job,
    ...updates,
    timestamp: new Date().toISOString(),
  };

  jobs.set(jobId, updatedJob);

  // Schedule cleanup if terminal state
  if (updatedJob.status === 'completed' || updatedJob.status === 'error') {
    scheduleCleanup(jobId);
  }

  return updatedJob;
}

/**
 * Delete a job
 */
export function deleteJob(jobId: string): boolean {
  return jobs.delete(jobId);
}

/**
 * Get all jobs (for debugging)
 */
export function getAllJobs(): JobState[] {
  return Array.from(jobs.values());
}

/**
 * Helper to update job progress
 */
export function updateJobProgress(
  jobId: string,
  progress: number,
  message?: string,
): JobState | undefined {
  return updateJob(jobId, {
    status: 'processing',
    progress: Math.max(0, Math.min(100, progress)),
    message: message || `Processing... ${progress}%`,
  });
}

/**
 * Helper to mark job as completed
 */
export function completeJob(
  jobId: string,
  documentId?: string,
  message?: string,
): JobState | undefined {
  return updateJob(jobId, {
    status: 'completed',
    progress: 100,
    message: message || 'Processing completed',
    documentId,
  });
}

/**
 * Helper to mark job as failed
 */
export function failJob(jobId: string, error: string): JobState | undefined {
  return updateJob(jobId, {
    status: 'error',
    message: 'Processing failed',
    error,
  });
}

// SSE support: listeners for job updates
type JobUpdateListener = (job: JobState) => void;
const listeners = new Map<string, Set<JobUpdateListener>>();

/**
 * Subscribe to job updates (for SSE)
 */
export function subscribeToJob(jobId: string, listener: JobUpdateListener): () => void {
  if (!listeners.has(jobId)) {
    listeners.set(jobId, new Set());
  }
  listeners.get(jobId)!.add(listener);

  // Return unsubscribe function
  return () => {
    const jobListeners = listeners.get(jobId);
    if (jobListeners) {
      jobListeners.delete(listener);
      if (jobListeners.size === 0) {
        listeners.delete(jobId);
      }
    }
  };
}

/**
 * Notify all listeners of a job update
 */
export function notifyJobUpdate(jobId: string, job: JobState) {
  const jobListeners = listeners.get(jobId);
  if (jobListeners) {
    jobListeners.forEach((listener) => listener(job));
  }
}

/**
 * Enhanced updateJob that notifies listeners
 */
export function updateJobWithNotification(
  jobId: string,
  updates: UpdateJobOptions,
): JobState | undefined {
  const updatedJob = updateJob(jobId, updates);
  if (updatedJob) {
    notifyJobUpdate(jobId, updatedJob);
  }
  return updatedJob;
}
