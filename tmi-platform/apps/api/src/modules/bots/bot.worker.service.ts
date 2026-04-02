import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BotWorkerService {
  private readonly logger = new Logger(BotWorkerService.name);

  // This service would contain the logic for processing jobs from a specific queue.
  // For example, a method decorated with @Process('job-name')
}
