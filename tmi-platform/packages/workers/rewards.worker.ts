import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const QUEUES = [
  'reward-drop',
  'winner-selection',
  'reward-fulfillment',
  'fraud-review',
  'avatar-grant',
  'coupon-issue',
];

async function processRewardJob(job: Job) {
  console.log(`[rewards.worker] Processing job ${job.id} on queue ${job.queueName}`, job.data);

  switch (job.queueName) {
    case 'reward-drop': {
      // Trigger a reward drop for a user/session
      const { userId, sessionId, rewardType, amount } = job.data;
      console.log(`[reward-drop] userId=${userId} sessionId=${sessionId} type=${rewardType} amount=${amount}`);
      // TODO: call RewardsEngine.triggerDrop(userId, sessionId, rewardType, amount)
      break;
    }

    case 'winner-selection': {
      // Select winner(s) from a pool
      const { sessionId, promptId, maxWinners } = job.data;
      console.log(`[winner-selection] sessionId=${sessionId} promptId=${promptId} maxWinners=${maxWinners}`);
      // TODO: call RewardsEngine.selectWinners(sessionId, promptId, maxWinners)
      break;
    }

    case 'reward-fulfillment': {
      // Fulfill a reward claim (ship, email, credit)
      const { claimId, fulfillmentType } = job.data;
      console.log(`[reward-fulfillment] claimId=${claimId} type=${fulfillmentType}`);
      // TODO: call FulfillmentService.fulfill(claimId, fulfillmentType)
      break;
    }

    case 'fraud-review': {
      // Flag and review suspicious reward claims
      const { userId, claimId, reason } = job.data;
      console.log(`[fraud-review] userId=${userId} claimId=${claimId} reason=${reason}`);
      // TODO: call FraudService.review(userId, claimId, reason)
      break;
    }

    case 'avatar-grant': {
      // Grant avatar item to user
      const { userId, itemId, itemType } = job.data;
      console.log(`[avatar-grant] userId=${userId} itemId=${itemId} type=${itemType}`);
      // TODO: call AvatarService.grantItem(userId, itemId, itemType)
      break;
    }

    case 'coupon-issue': {
      // Issue a coupon/promo code to user
      const { userId, sponsorId, couponCode } = job.data;
      console.log(`[coupon-issue] userId=${userId} sponsorId=${sponsorId} code=${couponCode}`);
      // TODO: call CouponService.issue(userId, sponsorId, couponCode)
      break;
    }

    default:
      console.warn(`[rewards.worker] Unknown queue: ${job.queueName}`);
  }
}

// Spin up a worker for each rewards queue
const workers = QUEUES.map(
  (queueName) =>
    new Worker(queueName, processRewardJob, {
      connection,
      concurrency: 5,
    })
);

workers.forEach((worker) => {
  worker.on('completed', (job) => {
    console.log(`[rewards.worker] ✅ Job ${job.id} completed on ${job.queueName}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[rewards.worker] ❌ Job ${job?.id} failed on ${job?.queueName}:`, err.message);
  });
});

console.log(`[rewards.worker] Started workers for queues: ${QUEUES.join(', ')}`);

export { workers };
