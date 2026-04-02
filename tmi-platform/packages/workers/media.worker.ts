import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const QUEUES = ['clip-highlight', 'replay-render', 'media-transcode', 'media-thumbnail'];

async function processMediaJob(job: Job) {
  console.log(`[media.worker] Processing job ${job.id} on queue ${job.queueName}`, job.data);

  switch (job.queueName) {
    case 'clip-highlight': {
      // Generate a highlight clip from a live session
      const { sessionId, startTimestamp, endTimestamp, userId } = job.data;
      console.log(`[clip-highlight] sessionId=${sessionId} start=${startTimestamp} end=${endTimestamp} userId=${userId}`);
      // TODO: call MuxService.createClip(sessionId, startTimestamp, endTimestamp)
      // TODO: store clip metadata in DB
      break;
    }

    case 'replay-render': {
      // Render a full replay of a session
      const { sessionId, quality, format } = job.data;
      console.log(`[replay-render] sessionId=${sessionId} quality=${quality} format=${format}`);
      // TODO: call MuxService.createReplay(sessionId, quality, format)
      break;
    }

    case 'media-transcode': {
      // Transcode uploaded media to target formats
      const { assetId, sourceUrl, targetFormats } = job.data;
      console.log(`[media-transcode] assetId=${assetId} source=${sourceUrl} formats=${targetFormats}`);
      // TODO: call MuxService.transcode(assetId, sourceUrl, targetFormats)
      break;
    }

    case 'media-thumbnail': {
      // Generate thumbnail from video asset
      const { assetId, timestampSeconds } = job.data;
      console.log(`[media-thumbnail] assetId=${assetId} timestamp=${timestampSeconds}s`);
      // TODO: call MuxService.generateThumbnail(assetId, timestampSeconds)
      break;
    }

    default:
      console.warn(`[media.worker] Unknown queue: ${job.queueName}`);
  }
}

const workers = QUEUES.map(
  (queueName) =>
    new Worker(queueName, processMediaJob, {
      connection,
      concurrency: 2, // Media jobs are CPU/bandwidth intensive
    })
);

workers.forEach((worker) => {
  worker.on('completed', (job) => {
    console.log(`[media.worker] ✅ Job ${job.id} completed on ${job.queueName}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[media.worker] ❌ Job ${job?.id} failed on ${job?.queueName}:`, err.message);
  });
});

console.log(`[media.worker] Started workers for queues: ${QUEUES.join(', ')}`);

export { workers };
