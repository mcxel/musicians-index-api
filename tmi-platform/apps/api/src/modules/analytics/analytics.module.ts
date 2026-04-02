import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../prisma/prisma.module';
import { AnalyticsEngine } from './analytics.engine';
import { StreamingGateway } from './streaming.gateway';
import { SceneEngine } from './scene.engine';
import { RoomManagerService } from './room.manager';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  providers: [AnalyticsEngine, StreamingGateway, SceneEngine, RoomManagerService],
  exports: [AnalyticsEngine, StreamingGateway, SceneEngine, RoomManagerService],
})
export class AnalyticsModule {}
