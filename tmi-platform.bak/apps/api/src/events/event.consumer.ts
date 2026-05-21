import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { PlatformEvent } from '../../../../../packages/contracts/src/events';

const prisma = new PrismaClient();

const redisConnection = {
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
};

function toBigIntSafe(value: unknown): bigint {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return BigInt(Math.trunc(value));
  if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) return BigInt(Math.trunc(Number(value)));
  return 0n;
}

async function handlePointsAwarded(event: PlatformEvent): Promise<void> {
  const userId = event.userId || (event.metadata?.userId as string | undefined);
  if (!userId) {
    throw new Error('points.awarded missing userId');
  }

  const amount = toBigIntSafe(event.metadata?.amount ?? 0);
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    select: { id: true, availableBalance: true },
  });

  if (!wallet) {
    throw new Error(`points.awarded wallet not found for user: ${userId}`);
  }

  const before = BigInt(wallet.availableBalance ?? 0);
  const delta = Number(amount);
  const after = before + BigInt(delta);

  await prisma.wallet.update({
    where: { id: wallet.id },
    data: {
      availableBalance: { increment: delta },
      lifetimeEarnings: { increment: delta },
    },
  });

  console.log('[event.consumer] side_effect points.awarded', {
    eventId: event.id,
    userId,
    walletId: wallet.id,
    before: before.toString(),
    amount: amount.toString(),
    after: after.toString(),
  });
}

export const eventConsumer = new Worker(
  'platform-events',
  async (job) => {
    const event = job.data as PlatformEvent;

    console.log('[event.consumer] processing', {
      jobId: String(job.id),
      eventId: event.id,
      type: event.type,
      attemptsMade: job.attemptsMade,
      timestamp: event.timestamp,
    });

    switch (event.type) {
      case 'points.awarded':
        await handlePointsAwarded(event);
        break;
      case 'sponsor.activated':
      case 'room.started':
      case 'booking.accepted':
      case 'ticket.scanned':
      case 'poll.created':
      case 'poll.started':
      case 'poll.voted':
      case 'poll.closed':
      case 'poll.result.published':
      case 'trivia.game.created':
      case 'trivia.round.started':
      case 'trivia.question.asked':
      case 'trivia.answer.submitted':
      case 'trivia.round.closed':
      case 'trivia.winner.declared':
      case 'julius.prompt.shown':
      case 'julius.announcement.sent':
      case 'julius.mode.changed':
      case 'julius.guidance.completed':
      default:
        break;
    }

    return { ok: true, type: event.type, eventId: event.id, jobId: String(job.id) };
  },
  {
    connection: redisConnection,
    removeOnComplete: { count: 200 },
    removeOnFail: { count: 500 },
  }
);

eventConsumer.on('failed', (job, err) => {
  const event = (job?.data ?? {}) as Partial<PlatformEvent>;
  console.error('[event.consumer] job failed', {
    jobId: job?.id,
    eventId: event.id,
    type: event.type,
    attemptsMade: job?.attemptsMade,
    error: err.message,
  });
});

eventConsumer.on('completed', (job) => {
  const event = (job.data ?? {}) as Partial<PlatformEvent>;
  console.log('[event.consumer] job completed', {
    jobId: job.id,
    eventId: event.id,
    type: event.type,
  });
});
