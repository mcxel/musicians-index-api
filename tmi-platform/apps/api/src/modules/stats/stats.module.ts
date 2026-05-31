import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { UniversalStatsEngine } from './universal-stats.engine';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StatsController],
  providers: [UniversalStatsEngine],
  exports: [UniversalStatsEngine],
})
export class StatsModule {}
