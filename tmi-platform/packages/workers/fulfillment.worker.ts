import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const QUEUES = ['reward-fulfillment', 'email-fulfillment', 'physical-fulfillment', 'digital-fulfillment'];

async function processFulfillmentJob(job: Job) {
  console.log(`[fulfillment.worker] Processing job ${job.id} on queue ${job.queueName}`, job.data);

  switch (job.queueName) {
    case 'reward-fulfillment': {
      const { claimId, userId, rewardType, fulfillmentData } = job.data;
      console.log(`[reward-fulfillment] claimId=${claimId} userId=${userId} type=${rewardType}`);
      // Route to appropriate sub-fulfillment based on rewardType
      // TODO: call FulfillmentRouter.route(claimId, rewardType, fulfillmentData)
      break;
    }

    case 'email-fulfillment': {
      // Send reward confirmation / coupon via email
      const { userId, email, subject, templateId, templateData } = job.data;
      console.log(`[email-fulfillment] userId=${userId} email=${email} template=${templateId}`);
      // TODO: call EmailService.send(email, subject, templateId, templateData)
      break;
    }

    case 'physical-fulfillment': {
      // Trigger physical prize shipment
      const { claimId, userId, shippingAddress, itemSku } = job.data;
      console.log(`[physical-fulfillment] claimId=${claimId} userId=${userId} sku=${itemSku}`);
      // TODO: call ShippingService.createShipment(claimId, shippingAddress, itemSku)
      break;
    }

    case 'digital-fulfillment': {
      // Deliver digital reward (code, download, credit)
      const { claimId, userId, deliveryType, payload } = job.data;
      console.log(`[digital-fulfillment] claimId=${claimId} userId=${userId} type=${deliveryType}`);
      // TODO: call DigitalDeliveryService.deliver(claimId, userId, deliveryType, payload)
      break;
    }

    default:
      console.warn(`[fulfillment.worker] Unknown queue: ${job.queueName}`);
  }
}

const workers = QUEUES.map(
  (queueName) =>
    new Worker(queueName, processFulfillmentJob, {
      connection,
      concurrency: 10,
    })
);

workers.forEach((worker) => {
  worker.on('completed', (job) => {
    console.log(`[fulfillment.worker] ✅ Job ${job.id} completed on ${job.queueName}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[fulfillment.worker] ❌ Job ${job?.id} failed on ${job?.queueName}:`, err.message);
  });
});

console.log(`[fulfillment.worker] Started workers for queues: ${QUEUES.join(', ')}`);

export { workers };
