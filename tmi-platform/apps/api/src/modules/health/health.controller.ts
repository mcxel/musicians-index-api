import { Controller, Get } from "@nestjs/common";

@Controller()
export class HealthController {
  @Get("/health")
  health() {
    return { ok: true };
  }

  @Get("/ready")
  ready() {
    // Expand later: DB ping, queue ping, etc.
    return { ready: true };
  }
}
