/**
 * BotAutomationEngine.ts — Automated Audience & Fan Lobby Behavior Engine
 *
 * Automates 360 BobbleHead Bot behavior across 3D venues and fan lobbies:
 * - Seated Audience Bots: Occupy 3D seats (reserveSeat → occupy), applaud, raise hands, send tipping pumps.
 * - DJ / Host Bots: Spin 360 turntable decks, start cypher rooms.
 * - Lobby Wanderer Bots: Inhabit 3D Fan World Lobbies (FanWorldSession.ts), demonstrating interactions so real fans enter and chat.
 */

import { assembleBobbleHeadBotAvatar, BobbleHeadBotAvatarConfig, generateAutomatedBotRoster } from '../avatar/BotAvatarAssembler';
import { occupySeat, vacateSeat } from '../venue/SeatPopulationEngine';

export interface AutomatedBotState {
  config: BobbleHeadBotAvatarConfig;
  currentRoomId: string | null;
  occupiedSeatId: string | null;
  isApplauseActive: boolean;
  isHandRaised: boolean;
  totalTipsSent: number;
  lastActionTimestamp: number;
}

class BotAutomationEngineService {
  private activeBots: Map<string, AutomatedBotState> = new Map();
  private isInitialized = false;

  public initialize(botCount: number = 30): void {
    if (this.isInitialized) return;

    const roster = generateAutomatedBotRoster(botCount);
    roster.forEach((config) => {
      this.activeBots.set(config.botId, {
        config,
        currentRoomId: null,
        occupiedSeatId: null,
        isApplauseActive: false,
        isHandRaised: false,
        totalTipsSent: 0,
        lastActionTimestamp: Date.now(),
      });
    });

    this.isInitialized = true;
  }

  /**
   * Deploys a cohort of 360 BobbleHead bots to occupy audience seats in a 3D venue room.
   */
  public deployBotsToVenue(roomId: string, seatCount: number = 12): void {
    this.initialize();

    let count = 0;
    for (const [botId, botState] of this.activeBots.entries()) {
      if (count >= seatCount) break;
      if (!botState.currentRoomId) {
        const seatId = `SEAT_ZONE_AUDIENCE_${count + 1}`;
        occupySeat(roomId, seatId, botId, botState.config.botName);
        
        botState.currentRoomId = roomId;
        botState.occupiedSeatId = seatId;
        botState.lastActionTimestamp = Date.now();
        count++;
      }
    }
  }

  /**
   * Recalls all bots from a 3D venue room, cleaning up seat occupancy.
   */
  public recallBotsFromVenue(roomId: string): void {
    for (const [, botState] of this.activeBots.entries()) {
      if (botState.currentRoomId === roomId && botState.occupiedSeatId) {
        vacateSeat(roomId, botState.occupiedSeatId);
        botState.currentRoomId = null;
        botState.occupiedSeatId = null;
      }
    }
  }

  /**
   * Triggers automated audience reactions (applause, tipping pumps, hand raises).
   */
  public triggerAudienceReaction(roomId: string, actionType: 'applause' | 'tip_pump' | 'raise_hand'): void {
    for (const [, botState] of this.activeBots.entries()) {
      if (botState.currentRoomId === roomId) {
        if (actionType === 'applause') {
          botState.isApplauseActive = true;
        } else if (actionType === 'raise_hand') {
          botState.isHandRaised = !botState.isHandRaised;
        } else if (actionType === 'tip_pump') {
          botState.totalTipsSent += 50;
        }
        botState.lastActionTimestamp = Date.now();
      }
    }
  }

  /**
   * Gets list of active bots in a specific room.
   */
  public getActiveBotsInRoom(roomId: string): AutomatedBotState[] {
    const roomBots: AutomatedBotState[] = [];
    for (const [, botState] of this.activeBots.entries()) {
      if (botState.currentRoomId === roomId) {
        roomBots.push(botState);
      }
    }
    return roomBots;
  }
}

export const BotAutomationEngine = new BotAutomationEngineService();
