import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BotsController } from './bots.controller';
import { BotsService } from './bots.service';
import { BotManagerService } from './bot.manager.service';
import { BotSchedulerService } from './bot.scheduler.service';
import { BotWorkerService } from './bot.worker.service';
import { BotClonerService } from './bot.cloner.service';
import { BotMonitorService } from './bot.monitor.service';
import { BOT_QUEUES } from './bots.queues';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    // Register all bot queues with BullMQ
    BullModule.registerQueue(...BOT_QUEUES.map((q) => ({ name: q }))),
  ],
  controllers: [BotsController],
  providers: [
    BotsService,
    BotManagerService,
    BotSchedulerService,
    BotWorkerService,
    BotClonerService,
    BotMonitorService,
  ],
  exports: [
    BotsService,
    BotManagerService,
    BotSchedulerService,
    BotWorkerService,
    BotClonerService,
    BotMonitorService,
  ],
})
export class BotsModule {}
