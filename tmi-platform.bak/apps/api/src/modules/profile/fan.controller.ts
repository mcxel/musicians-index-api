import { Controller, Get, Param } from '@nestjs/common';
import { FanService } from './fan.service';

@Controller('fan')
export class FanController {
  constructor(private readonly fanService: FanService) {}

  @Get(':username')
  async getFanByUsername(@Param('username') username: string) {
    return this.fanService.getFanByUsername(username);
  }
}
