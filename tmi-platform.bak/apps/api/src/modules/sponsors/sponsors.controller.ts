import { Controller, Get } from '@nestjs/common';
import { SponsorsService } from './sponsors.service';

@Controller('sponsors')
export class SponsorsController {
  constructor(private readonly sponsorsService: SponsorsService) {}

  @Get('health')
  health() {
    return { status: 'ok', module: 'sponsors' };
  }

  @Get('active')
  getActive() {
    return this.sponsorsService.getActivePackages();
  }

  @Get()
  getAll() {
    return this.sponsorsService.getAll();
  }
}
