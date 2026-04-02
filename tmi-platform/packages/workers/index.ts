/**
 * TMI Platform — Worker Registry
 * Starts all BullMQ workers for the platform.
 * Run with: npx ts-node packages/workers/index.ts
 * Or via process manager (PM2, Docker, etc.)
 */

import { workers as rewardsWorkers } from './rewards.worker';
import { workers as searchWorkers } from './search.worker';
import { workers as mediaWorkers } from './media.worker';
import { workers as fulfillmentWorkers } from './fulfillment.worker';
import { workers as recommendationWorkers } from './recommendation.worker';

const allWorkers = [
  ...rewardsWorkers,
  ...searchWorkers,
  ...mediaWorkers,
  ...fulfillmentWorkers,
  ...recommendationWorkers,
];

console.log(`[workers/index] 🚀 TMI Platform Workers started — ${allWorkers.length} total workers active`);

// Graceful shutdown
async function shutdown(signal: string) {
  console.log(`[workers/index] Received ${signal} — shutting down workers gracefully...`);
  await Promise.all(allWorkers.map((w) => w.close()));
  console.log('[workers/index] All workers closed. Exiting.');
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export { allWorkers };
