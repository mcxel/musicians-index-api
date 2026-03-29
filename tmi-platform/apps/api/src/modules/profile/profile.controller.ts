import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  async getMe(@Req() req) {
    // Assume userId is available on req.user or session
    return this.profileService.getMe(req.user?.id);
  }

  @Post('update')
  async updateProfile(@Req() req, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(req.user?.id, dto);
  }
}
