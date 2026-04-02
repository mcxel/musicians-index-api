import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const QUEUES = ['recommendation-refresh', 'recommendation-train', 'recommendation-score'];

async function processRecommendationJob(job: Job) {
  console.log(`[recommendation.worker] Processing job ${job.id} on queue ${job.queueName}`, job.data);

  switch (job.queueName) {
    case 'recommendation-refresh': {
      // Refresh personalized recommendations for a user
      const { userId, context, limit } = job.data;
      console.log(`[recommendation-refresh] userId=${userId} context=${context} limit=${limit}`);
      // TODO: call RecommendationEngine.refreshForUser(userId, context, limit)
      break;
    }

    case 'recommendation-train': {
      // Retrain recommendation model with new interaction data
      const { modelType, datasetVersion, batchSize } = job.data;
      console.log(`[recommendation-train] model=${modelType} dataset=${datasetVersion} batch=${batchSize}`);
      // TODO: call RecommendationEngine.train(modelType, datasetVersion, batchSize)
      break;
    }

    case 'recommendation-score': {
      // Score a set of items for a user
      const { userId, itemIds, scoreType } = job.data;
      console.log(`[recommendation-score] userId=${userId} items=${itemIds?.length} type=${scoreType}`);
      // TODO: call RecommendationEngine.score(userId, itemIds, scoreType)
      break;
    }

    default:
      console.warn(`[recommendation.worker] Unknown queue: ${job.queueName}`);
  }
}

const workers = QUEUES.map(
  (queueName) =>
    new Worker(queueName, processRecommendationJob, {
      connection,
      concurrency: 3,
    })
);

workers.forEach((worker) => {
  worker.on('completed', (job) => {
    console.log(`[recommendation.worker] ✅ Job ${job.id} completed on ${job.queueName}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[recommendation.worker] ❌ Job ${job?.id} failed on ${job?.queueName}:`, err.message);
  });
});

console.log(`[recommendation.worker] Started workers for queues: ${QUEUES.join(', ')}`);

export { workers };
