import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    @InjectQueue('platform-pipelines') private pipelineQueue: Queue,
    private prisma: PrismaService,
  ) {}

  // --------------------------------------------------------
  // WEEKLY TASKS
  // --------------------------------------------------------
  
  @Cron('0 0 * * 0') // Every Sunday at midnight
  async triggerWeeklyCrowns() {
    this.logger.log('Triggering Weekly Crowns Pipeline...');
    await this.pipelineQueue.add('weekly-crowns', { timestamp: new Date() });
  }

  @Cron('0 2 * * 0') // Every Sunday at 2 AM
  async triggerSponsorBilling() {
    this.logger.log('Triggering Sponsor Billing Pipeline...');
    await this.pipelineQueue.add('sponsor-billing', { timestamp: new Date() });
  }

  @Cron('0 4 * * 0') // Every Sunday at 4 AM
  async triggerCreatorPayouts() {
    this.logger.log('Triggering Creator Payouts Pipeline...');
    await this.pipelineQueue.add('creator-payouts', { timestamp: new Date() });
  }

  // --------------------------------------------------------
  // DAILY TASKS
  // --------------------------------------------------------

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async triggerDailyRankings() {
    this.logger.log('Triggering Daily Rankings Refresh...');
    await this.pipelineQueue.add('daily-rankings', { timestamp: new Date() });
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async triggerDatabaseBackups() {
    this.logger.log('Triggering Database & Asset Backups...');
    await this.pipelineQueue.add('system-backups', { timestamp: new Date() });
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupReplays() {
    this.logger.log('Triggering Replay & Clip Cleanup...');
    await this.pipelineQueue.add('replay-cleanup', { timestamp: new Date() });
  }

  // --------------------------------------------------------
  // HOURLY TASKS
  // --------------------------------------------------------

  @Cron(CronExpression.EVERY_HOUR)
  async refreshTrending() {
    this.logger.log('Refreshing Trending Engine...');
    await this.pipelineQueue.add('refresh-trending', { timestamp: new Date() });
  }

  @Cron(CronExpression.EVERY_HOUR)
  async runFraudScans() {
    this.logger.log('Running Platform Fraud Scans...');
    await this.pipelineQueue.add('fraud-scans', { timestamp: new Date() });
  }

  // --------------------------------------------------------
  // MONTHLY TASKS
  // --------------------------------------------------------

  @Cron('0 0 1 * *') // First day of every month
  async archiveMagazineIssue() {
    this.logger.log('Archiving Monthly Magazine Issue...');
    await this.pipelineQueue.add('archive-issue', { timestamp: new Date() });
  }

  // Utility to log execution for Michael Charlie's oversight
  private async logCronExecution(jobName: string, durationMs: number, status: 'SUCCESS' | 'ERROR', details?: string) {
    await this.prisma.cronJobLog.create({
      data: {
        jobName, status, durationMs, details
      }
    });
  }
}