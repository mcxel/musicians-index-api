import { Controller, Get } from '@nestjs/common';
import { RoomsService } from './rooms.service';

/**
 * RoomsController
 * SCAFFOLD: Manages room creation, joining, and state.
 */
@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get('health')
  health() {
    return { status: 'ok', module: 'rooms' };
  }
}
