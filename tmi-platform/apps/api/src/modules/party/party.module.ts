import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PartyController } from './party.controller';
import { PartyService } from './party.service';
import { PartyGateway } from './party.gateway';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [PartyController],
  providers: [PartyService, PartyGateway],
  exports: [PartyService, PartyGateway],
})
export class PartyModule {}
