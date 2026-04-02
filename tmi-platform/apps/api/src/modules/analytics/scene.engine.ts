import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SceneEngine {
  private readonly logger = new Logger(SceneEngine.name);

  /**
   * Calculates the exact lighting, camera cuts, and visualizer overlays
   * based on the raw effect triggered by the host or crowd.
   */
  calculateCinematicEffect(roomId: string, baseEffect: string) {
    this.logger.debug(`Calculating cinematic physics for effect: ${baseEffect} in room: ${roomId}`);
    
    // Supercharging a simple trigger into a 100% visual cinematic event
    const cinematicMap: Record<string, any> = {
      'fireworks': {
        particleType: '3D_EXPLOSION',
        cameraShake: true,
        lightingShift: 'STROBE_GOLD',
        audioCue: 'SFX_CROWD_CHEER_MAX',
        durationMs: 4500
      },
      'boo_meter_danger': {
        particleType: 'SMOKE_RED',
        cameraShake: false,
        lightingShift: 'DIM_RED',
        audioCue: 'SFX_ROBOT_WARNING',
        durationMs: 3000
      }
    };

    return cinematicMap[baseEffect] || {
      particleType: baseEffect,
      cameraShake: false,
      lightingShift: 'DEFAULT'
    };
  }
}