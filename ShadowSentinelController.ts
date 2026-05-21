import { BotProfileGenerator } from '../profiles/BotProfileGenerator';
import { ShadowSentinelDiagnosticRegistry } from './ShadowSentinelDiagnosticRegistry';

/**
 * TMI Shadow Sentinel Pacing & Deployment Controller
 * Manages the "Drip-Feed" gate and the Confidence Spark logic.
 */
export class ShadowSentinelController {
  private static activeRooms = new Map<string, any>();
  private static readonly MAX_BOTS_PER_ROOM = 10;

  /**
   * Monitors a room and safely drips bots in to build momentum.
   */
  static async monitorAndPaceRoom(roomId: string, humanCount: number, isPerformerLive: boolean) {
    if (!isPerformerLive) return;

    let roomState = this.activeRooms.get(roomId) || { botCount: 0, lastSpawnTime: Date.now() };

    // If the room is empty of humans, open the Pacing Gate
    if (humanCount === 0 && roomState.botCount < this.MAX_BOTS_PER_ROOM) {
      const timeSinceLastSpawn = Date.now() - roomState.lastSpawnTime;
      
      // First bot waits 30s, subsequent bots randomized between 45s and 90s
      const isFirstBot = roomState.botCount === 0;
      const spawnDelay = isFirstBot ? 30000 : Math.random() * (90000 - 45000) + 45000;

      if (timeSinceLastSpawn >= spawnDelay) {
        await this.spawnBotWithConfidenceSpark(roomId, roomState);
      }
    }
    
    // Trigger background room diagnostics
    await ShadowSentinelDiagnosticRegistry.runBackgroundCheck(roomId);
  }

  private static async spawnBotWithConfidenceSpark(roomId: string, roomState: any) {
    const botProfile = BotProfileGenerator.generateBotSquad(1)[0];
    
    roomState.botCount += 1;
    roomState.lastSpawnTime = Date.now();
    this.activeRooms.set(roomId, roomState);

    console.log(`[PACING_GATE] Ghost Force bot ${botProfile.displayName} seated in ${roomId}.`);

    // The Confidence Spark: Emit a hype emote within 10 seconds of sitting
    setTimeout(() => {
      this.triggerConfidenceSpark(roomId, botProfile);
    }, Math.random() * 10000);
  }

  private static triggerConfidenceSpark(roomId: string, botProfile: any) {
    const sparkEmote = botProfile.behaviorProfile.preferredEmotes[0] || '💯';
    console.log(`[CONFIDENCE_SPARK] ${botProfile.displayName} threw ${sparkEmote} in room ${roomId}.`);
    
    // Here we would push the event to the WebSockets/Real-Time Event Bus
    // GlobalPulse.emit('EFFECT_TRIGGERED', { roomId, userId: botProfile.botId, effect: sparkEmote });
  }
  
  static getRoomBotCount(roomId: string): number {
    return this.activeRooms.get(roomId)?.botCount || 0;
  }
}