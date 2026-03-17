// tmi-platform/apps/api/src/modules/presence/presence.module.ts
import { Module } from '@nestjs/common';
import { PresenceController } from './presence.controller';
import { PresenceService } from './presence.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { AuthGuard } from '../auth/guards/auth.guard';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule],
  controllers: [PresenceController],
  providers: [PresenceService, AuthGuard],
})
export class PresenceModule {}
