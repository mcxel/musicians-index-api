import { Module } from '@nestjs/common';
import { ParticipationController } from '../../../../participation.controller'; // Temporary path match to your context location
import { ParticipationLedgerService } from '../../../../participation-ledger.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ParticipationController],
  providers: [ParticipationLedgerService],
  exports: [ParticipationLedgerService],
})
export class ParticipationModule {}