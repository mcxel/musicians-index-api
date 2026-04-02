import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class BotSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(BotSchedulerService.name);

  constructor(
    @InjectQueue('system-health') private readonly healthQueue: Queue,
    @InjectQueue('analytics-aggregation')
    private readonly analyticsQueue: Queue,
  ) {}

  onModuleInit() {
    this.logger.log('Initializing bot schedulers...');
    this.scheduleSystemHealthCheck();
    this.scheduleDailyAnalytics();
  }

  async scheduleSystemHealthCheck() {
    await this.removeRepeatableJob('system-health-check', this.healthQueue);
    this.logger.log('Scheduling system health check to run every 5 minutes.');
    await this.healthQueue.add('run-health-check', {}, {
      repeat: { every: 1000 * 60 * 5 }, // 5 minutes
      jobId: 'system-health-check',
    });
  }

  async scheduleDailyAnalytics() {
    await this.removeRepeatableJob('daily-analytics', this.analyticsQueue);
    this.logger.log('Scheduling daily analytics aggregation.');
    await this.analyticsQueue.add('aggregate-daily', {}, {
      repeat: { pattern: '0 2 * * *' }, // Every day at 2:00 AM
      jobId: 'daily-analytics',
    });
  }

  private async removeRepeatableJob(jobId: string, queue: Queue) {
    const repeatableJobs = await queue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      if (job.id === jobId) {
        await queue.removeRepeatableByKey(job.key);
        this.logger.log(`Removed old repeatable job: ${jobId} from ${queue.name}`);
      }
    }
  }
}
