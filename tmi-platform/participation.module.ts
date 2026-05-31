import { Module } from '@nestjs/common';
import { ParticipationController } from './participation.controller';
import { ParticipationLedgerService } from './participation-ledger.service';

@Module({
  controllers: [ParticipationController],
  providers: [ParticipationLedgerService],
  exports: [ParticipationLedgerService],
})
export class ParticipationModule {}