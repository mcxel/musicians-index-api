import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class BotsService {
  private readonly logger = new Logger(BotsService.name);

  constructor(
    // Example of injecting a specific queue to add jobs to it.
    // This service can be expanded to include methods for all queues.
    @InjectQueue('recommendation-generation')
    private readonly recommendationQueue: Queue,
  ) {}

  async triggerArtistRecommendation(payload: { userId: string }) {
    this.logger.log(`Adding artist recommendation job for user ${payload.userId}...`);
    await this.recommendationQueue.add('generate-for-user', payload);
    return { success: true, message: 'Artist recommendation job queued.' };
  }
}
