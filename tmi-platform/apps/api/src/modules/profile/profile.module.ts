import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ArtistController } from './artist.controller';
import { FanController } from './fan.controller';
import { ProfileService } from './profile.service';
import { ArtistService } from './artist.service';
import { FanService } from './fan.service';
import { ProfileRepository } from './profile.repository';

@Module({
  controllers: [ProfileController, ArtistController, FanController],
  providers: [ProfileService, ArtistService, FanService, ProfileRepository],
})
export class ProfileModule {}
