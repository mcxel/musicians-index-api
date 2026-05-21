import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';

@Processor('dead-letter-queue')
export class DeadLetterProcessor extends WorkerHost {
  private readonly logger = new Logger(DeadLetterProcessor.name);

  async process(job: Job<any>): Promise<void> {
    try {
      this.logger.error(`Dead letter job received: ${job.name}`, job.data);
    } catch (error) {
      this.logger.error('Dead letter processor error', error);
    }
  }
}
