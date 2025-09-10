// src/services/record-usage.ts
import { server as organizationServer } from '@/modules/core/organizations';
import { server as userServer } from '@/modules/core/users';

type UsageLike = { usage?: { totalTokens?: number } };

/**
 * Records AI token usage for both user and org in one call.
 * Pass either totalTokens or the raw response object.
 */
export async function recordAiTokenUsage(opts: {
  userId: string;
  orgId: string;
  totalTokens?: number;
  response?: UsageLike;
}): Promise<void> {
  const tokens = opts.totalTokens ?? opts.response?.usage?.totalTokens ?? 0;

  if (tokens <= 0) return;

  await Promise.allSettled([
    userServer.updateUserUsage(opts.userId, { aiTokensUsed: tokens }),
    organizationServer.updateOrgUsage(opts.orgId, { aiTokenUsage: tokens }),
  ]);
}

// Usage tracking queue for batching
interface UsageRecord {
  userId: string;
  orgId: string;
  tokens: number;
  timestamp: Date;
}

class UsageTracker {
  private queue: UsageRecord[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_DELAY_MS = 5000; // 5 seconds

  async addUsage(userId: string, orgId: string, tokens: number): Promise<void> {
    if (tokens <= 0) return;

    this.queue.push({
      userId,
      orgId,
      tokens,
      timestamp: new Date(),
    });

    // Process immediately if batch is full, otherwise schedule
    if (this.queue.length >= this.BATCH_SIZE) {
      await this.processBatch();
    } else {
      this.scheduleBatchProcessing();
    }
  }

  private scheduleBatchProcessing(): void {
    if (this.batchTimeout) return; // Already scheduled

    this.batchTimeout = setTimeout(async () => {
      await this.processBatch();
    }, this.BATCH_DELAY_MS);
  }

  private async processBatch(): Promise<void> {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    if (this.queue.length === 0) return;

    const batch = this.queue.splice(0, this.BATCH_SIZE);

    // Aggregate usage by user and org
    const userUsage = new Map<string, number>();
    const orgUsage = new Map<string, number>();

    for (const record of batch) {
      userUsage.set(record.userId, (userUsage.get(record.userId) || 0) + record.tokens);
      orgUsage.set(record.orgId, (orgUsage.get(record.orgId) || 0) + record.tokens);
    }

    // Update database in parallel
    const updatePromises: Promise<any>[] = [];

    for (const [userId, tokens] of userUsage) {
      updatePromises.push(
        userServer.updateUserUsage(userId, { aiTokensUsed: tokens }).catch((error) => {
          console.error(`Failed to update user usage for ${userId}:`, error);
        }),
      );
    }

    for (const [orgId, tokens] of orgUsage) {
      updatePromises.push(
        organizationServer.updateOrgUsage(orgId, { aiTokenUsage: tokens }).catch((error) => {
          console.error(`Failed to update org usage for ${orgId}:`, error);
        }),
      );
    }

    await Promise.allSettled(updatePromises);

    // Calculate total tokens in this batch
    const totalTokens = batch.reduce((sum, r) => sum + r.tokens, 0);

    console.log(
      `Processed usage batch: ${batch.length} record${batch.length > 1 ? 's' : ''}, ${totalTokens} tokens used`,
    );

    // Continue processing if more items were added
    if (this.queue.length > 0) {
      this.scheduleBatchProcessing();
    }
  }
}

// Global instance for batched usage tracking
const usageTracker = new UsageTracker();

/**
 * Asynchronously record AI token usage without blocking the response.
 * Uses batching to optimize database updates.
 */
export async function recordAiTokenUsageAsync(opts: {
  userId: string;
  orgId: string;
  totalTokens?: number;
  response?: UsageLike;
}): Promise<void> {
  const tokens = opts.totalTokens ?? opts.response?.usage?.totalTokens ?? 0;

  if (tokens <= 0) return;

  // Add to batch queue - this is non-blocking
  return usageTracker.addUsage(opts.userId, opts.orgId, tokens);
}
