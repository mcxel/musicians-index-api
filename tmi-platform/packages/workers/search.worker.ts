import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const QUEUES = ['recommendation-refresh', 'search-index-update', 'search-reindex'];

async function processSearchJob(job: Job) {
  console.log(`[search.worker] Processing job ${job.id} on queue ${job.queueName}`, job.data);

  switch (job.queueName) {
    case 'recommendation-refresh': {
      // Refresh recommendations for a user or globally
      const { userId, context } = job.data;
      console.log(`[recommendation-refresh] userId=${userId} context=${context}`);
      // TODO: call RecommendationEngine.refresh(userId, context)
      break;
    }

    case 'search-index-update': {
      // Incrementally update a search index document
      const { indexName, documentId, document } = job.data;
      console.log(`[search-index-update] index=${indexName} docId=${documentId}`);
      // TODO: call MeilisearchClient.updateDocument(indexName, documentId, document)
      break;
    }

    case 'search-reindex': {
      // Full reindex of a collection
      const { indexName, batchSize } = job.data;
      console.log(`[search-reindex] index=${indexName} batchSize=${batchSize}`);
      // TODO: call MeilisearchClient.reindex(indexName, batchSize)
      break;
    }

    default:
      console.warn(`[search.worker] Unknown queue: ${job.queueName}`);
  }
}

const workers = QUEUES.map(
  (queueName) =>
    new Worker(queueName, processSearchJob, {
      connection,
      concurrency: 3,
    })
);

workers.forEach((worker) => {
  worker.on('completed', (job) => {
    console.log(`[search.worker] ✅ Job ${job.id} completed on ${job.queueName}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[search.worker] ❌ Job ${job?.id} failed on ${job?.queueName}:`, err.message);
  });
});

console.log(`[search.worker] Started workers for queues: ${QUEUES.join(', ')}`);

export { workers };
