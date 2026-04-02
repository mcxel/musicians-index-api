import { Module } from '@nestjs/common';
import { RoomsModule } from '../rooms/rooms.module';
import { LobbiesModule } from './lobbies/lobbies.module';
import { AuditoriumModule } from './auditorium/auditorium.module';
import { PartyModule } from './party/party.module';
import { JuliusModule } from '../julius/julius.module';

/**
 * The master module for the TMI Live World ecosystem.
 * It imports and orchestrates all sub-modules related to
 * live events, social spaces, and interactive characters.
 */
@Module({
  imports: [
    RoomsModule, // Already scaffolded by Blackbox
    LobbiesModule,
    AuditoriumModule,
    PartyModule,
    JuliusModule,
  ],
})
export class LiveWorldModule {}