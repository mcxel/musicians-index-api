import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BotFactoryService {
  private readonly logger = new Logger(BotFactoryService.name);

  /**
   * Spawns fully sentient 3D animatronic host bots into live rooms
   */
  async spawnAnimatronicHost(hostType: 'JULIUS' | 'GREGORY_MARCEL' | 'RECORD_RALPH', roomId: string) {
    this.logger.log(`Spawning ${hostType} into room ${roomId}`);
    
    const hostConfig = {
      JULIUS: {
        model: 'meerkat_v2.glb',
        animations: ['idle', 'throw_confetti', 'pop_up_poll'],
        voiceModel: 'cheeky_magician_v1'
      },
      GREGORY_MARCEL: {
        model: 'gregory_host.glb',
        animations: ['walk_on', 'hype_crowd', 'point_camera'],
        voiceModel: 'smooth_alabama_v1'
      },
      RECORD_RALPH: {
        model: 'dj_ralph.glb',
        animations: ['scratch', 'head_nod', 'transition_mix'],
        voiceModel: 'florida_cool_v1'
      }
    };

    // Return the configuration for the frontend WebGL engine to render
    return hostConfig[hostType];
  }
}