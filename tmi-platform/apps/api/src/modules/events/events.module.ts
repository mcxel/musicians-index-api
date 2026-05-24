import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { EventsController } from './events.controller';
import { EventsUnifiedController } from './events.unified.controller';
import { EventsService } from './events.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [EventsController, EventsUnifiedController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
