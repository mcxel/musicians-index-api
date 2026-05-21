import { Queue, JobsOptions } from 'bullmq';
import { PlatformEvent } from '../../../../../packages/contracts/src/events';

const redisConnection = {
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
};

const queue = new Queue<PlatformEvent>('platform-events', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 200,
    removeOnFail: 500,
  },
});

export async function publishPlatformEvent(event: PlatformEvent, options?: JobsOptions): Promise<void> {
  try {
    await queue.add(event.type, event, options);
  } catch (error) {
    console.error('[event.producer] Failed to publish event', {
      eventId: event.id,
      type: event.type,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
