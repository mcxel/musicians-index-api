import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export interface NotificationJobData {
  userId: string;
  type: string; // e.g., 'REWARD_UNLOCKED'
  data: Record<string, any>;
}

@Injectable()
export class NotificationsProducerService {
  constructor(@InjectQueue('notifications') private readonly notificationsQueue: Queue) {}

  async addNotificationJob(jobData: NotificationJobData): Promise<void> {
    await this.notificationsQueue.add('send-notification', jobData, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
  }
}
