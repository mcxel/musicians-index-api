import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { BOT_QUEUES } from './bots.queues';

@Injectable()
export class BotManagerService implements OnModuleInit {
  private readonly logger = new Logger(BotManagerService.name);
  private queues: Map<string, Queue> = new Map();

  constructor(private readonly moduleRef: ModuleRef) {}

  onModuleInit() {
    for (const qName of BOT_QUEUES) {
      try {
        const token = getQueueToken(qName);
        const queue = this.moduleRef.get<Queue>(token, { strict: false });
        this.queues.set(qName, queue);
      } catch {
        this.logger.warn(`Queue not found in DI: ${qName}`);
      }
    }
    this.logger.log(`BotManagerService initialized with ${this.queues.size} queues.`);
  }

  /**
   * Provides a status overview of all managed bot queues.
   */
  async getSystemStatus() {
    this.logger.log('Fetching bot system status...');
    const status = {};
    for (const [name, queue] of this.queues.entries()) {
      status[name] = await queue.getJobCounts();
    }
    return status;
  }

  /**
   * This is a conceptual implementation of the "Bot Cloner".
   * In a BullMQ context, this scales the number of concurrent jobs a worker can process.
   * A more advanced implementation could interact with Kubernetes/Docker to scale the number of worker *containers*.
   */
  async scaleWorkers(queueName: string, concurrency: number) {
    const queue = this.queues.get(queueName);
    if (!queue) {
      this.logger.warn(`Attempted to scale unknown queue: ${queueName}`);
      return { success: false, message: `Queue ${queueName} not found.` };
    }

    this.logger.log(`Issuing scaling request for queue ${queueName} to concurrency ${concurrency}`);

    // In a real-world scenario, this would publish a message to a Redis channel
    // that the target worker process is subscribed to. The worker would then
    // gracefully shut down and restart with the new concurrency setting.

    return {
      success: true,
      message: `Scaling request for ${queueName} to ${concurrency} workers has been issued.`,
    };
  }
}
