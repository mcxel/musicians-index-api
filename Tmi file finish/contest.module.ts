/**
 * contest.module.ts
 * TMI Grand Platform Contest — NestJS Module
 * BerntoutGlobal XXL
 *
 * Repo path: apps/api/src/modules/contest/contest.module.ts
 * Wiring: Import in apps/api/src/app.module.ts
 *
 * In app.module.ts, add:
 *   import { ContestModule } from './modules/contest/contest.module';
 *   @Module({ imports: [..., ContestModule] })
 */

import { Module } from '@nestjs/common';
import { ContestController } from './contest.controller';
import { ContestService } from './contest.service';

@Module({
  imports: [
    // PrismaModule,           // uncomment when prisma module is available
    // EventEmitterModule,     // for analytics event bus
    // AuthModule,             // for JwtAuthGuard
  ],
  controllers: [ContestController],
  providers: [ContestService],
  exports: [ContestService],   // export so other modules (bots, analytics) can use
})
export class ContestModule {}
