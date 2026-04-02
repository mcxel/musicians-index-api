import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { CronService } from './cron.service';
import { PipelineProcessor } from './pipeline.processor';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue({
      name: 'platform-pipelines',
    }),
    PrismaModule,
  ],
  providers: [CronService, PipelineProcessor],
  exports: [CronService],
})
export class AutomationModule {}