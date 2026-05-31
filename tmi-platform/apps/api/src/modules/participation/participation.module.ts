import { Module } from '@nestjs/common';
import { ParticipationController } from './participation.controller';
import { ParticipationLedgerService } from './participation-ledger.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ParticipationController],
  providers: [ParticipationLedgerService],
  exports: [ParticipationLedgerService],
})
export class ParticipationModule {}
