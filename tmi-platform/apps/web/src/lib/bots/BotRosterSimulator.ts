/**
 * BotRosterSimulator — test harness for simulating human takeover of bot seats.
 *
 * Lets the admin page (and tests) run a time-compressed simulation of users
 * earning XP, displacing bots, and rising through the orbital wheel rankings.
 *
 * This is a simulation/testing utility only — never run in production data paths.
 * All state is in-memory and resets when the module reloads.
 */

import {
  BOT_ACCOUNT_REGISTRY,
  getBotForSeat,
  displaceBotFromSeat,
  type BotAccount,
} from './BotAccountRegistry';

export interface SimulatedUser {
  id: string;
  displayName: string;
  genre: string;
  xp: number;
  targetCategory: string;
  targetPosition: number;
}

export interface SimulationEvent {
  tick: number;
  type: 'XP_GAINED' | 'BOT_CHALLENGED' | 'BOT_DISPLACED' | 'SEAT_HELD' | 'USER_ENTERED_TOP3';
  userId: string;
  userName: string;
  message: string;
  xpBefore?: number;
  xpAfter?: number;
  botId?: string;
  botName?: string;
  category?: string;
  position?: number;
}

export interface SimulationResult {
  totalTicks: number;
  events: SimulationEvent[];
  finalRoster: Array<{
    category: string;
    position: number;
    occupant: string;
    type: 'HUMAN' | 'BOT';
    score: number;
  }>;
  displacementsCompleted: number;
  humanSeats: number;
  botSeats: number;
}

const XP_PER_TICK_RANGE: [number, number] = [150, 800];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randXp(): number {
  return randInt(XP_PER_TICK_RANGE[0], XP_PER_TICK_RANGE[1]);
}

/**
 * Run a simulation of N users competing to displace bots across the top rankings.
 *
 * @param users  Simulated human users — provide as many as you want to test crowding
 * @param ticks  Number of activity cycles (1 tick = one XP-earning event per user)
 * @param seed   Set to a number for reproducible runs, undefined for random
 */
export function runBotDisplacementSimulation(
  users: SimulatedUser[],
  ticks = 20,
  onProgress?: (event: SimulationEvent) => void
): SimulationResult {
  const events: SimulationEvent[] = [];
  let displacementsCompleted = 0;

  // Clone the bot registry state so we don't mutate the real registry permanently.
  // In production, displaceBotFromSeat() would write to DB; here we track locally.
  const localDisplaced = new Set<string>();

  const botForSeat = (category: string, pos: number): BotAccount | undefined => {
    const bot = getBotForSeat(category, pos);
    if (!bot) return undefined;
    if (localDisplaced.has(bot.id)) return undefined;
    return bot;
  };

  for (let tick = 1; tick <= ticks; tick++) {
    for (const user of users) {
      const gained = randXp();
      const xpBefore = user.xp;
      user.xp += gained;

      const xpGainEvent: SimulationEvent = {
        tick,
        type: 'XP_GAINED',
        userId: user.id,
        userName: user.displayName,
        message: `+${gained.toLocaleString()} XP earned (total: ${user.xp.toLocaleString()})`,
        xpBefore,
        xpAfter: user.xp,
        category: user.targetCategory,
        position: user.targetPosition,
      };
      events.push(xpGainEvent);
      onProgress?.(xpGainEvent);

      // Check if this user can displace the bot at their target seat
      const bot = botForSeat(user.targetCategory, user.targetPosition);
      if (bot) {
        if (user.xp >= bot.humanTakeoverThreshold * 0.8) {
          // In challenge range — announce
          const challengeEvent: SimulationEvent = {
            tick,
            type: 'BOT_CHALLENGED',
            userId: user.id,
            userName: user.displayName,
            message: `${user.displayName} is challenging [BOT] ${bot.displayName} for ${user.targetCategory} #${user.targetPosition} (${user.xp.toLocaleString()} / ${bot.humanTakeoverThreshold.toLocaleString()} XP needed)`,
            botId: bot.id,
            botName: bot.displayName,
            category: user.targetCategory,
            position: user.targetPosition,
          };
          events.push(challengeEvent);
          onProgress?.(challengeEvent);
        }

        if (user.xp >= bot.humanTakeoverThreshold) {
          // Threshold reached — displace
          localDisplaced.add(bot.id);
          displaceBotFromSeat(bot.id, user.id);
          displacementsCompleted++;

          const displaceEvent: SimulationEvent = {
            tick,
            type: 'BOT_DISPLACED',
            userId: user.id,
            userName: user.displayName,
            message: `🏆 ${user.displayName} DISPLACED [BOT] ${bot.displayName} from ${user.targetCategory} #${user.targetPosition}! Seat is now human-owned.`,
            botId: bot.id,
            botName: bot.displayName,
            category: user.targetCategory,
            position: user.targetPosition,
          };
          events.push(displaceEvent);
          onProgress?.(displaceEvent);

          // Move user's target to the next position up
          if (user.targetPosition > 1) {
            user.targetPosition -= 1;
          }
        }
      } else {
        // Seat already human-held or no bot at this position
        const seatHeldEvent: SimulationEvent = {
          tick,
          type: user.targetPosition <= 3 ? 'USER_ENTERED_TOP3' : 'SEAT_HELD',
          userId: user.id,
          userName: user.displayName,
          message:
            user.targetPosition <= 3
              ? `${user.displayName} holds a Top 3 seat in ${user.targetCategory} at position #${user.targetPosition}`
              : `${user.displayName} continues climbing — next target: ${user.targetCategory} #${user.targetPosition}`,
          category: user.targetCategory,
          position: user.targetPosition,
        };
        events.push(seatHeldEvent);
        onProgress?.(seatHeldEvent);
      }
    }
  }

  // Build final roster snapshot
  const finalRoster: SimulationResult['finalRoster'] = [];
  const categories = [...new Set(BOT_ACCOUNT_REGISTRY.flatMap((b) => b.assignments.map((a) => a.category)))];

  for (const category of categories) {
    const positions = [...new Set(
      BOT_ACCOUNT_REGISTRY
        .filter((b) => b.assignments.some((a) => a.category === category))
        .flatMap((b) => b.assignments.filter((a) => a.category === category).map((a) => a.rankPosition))
    )].sort((a, b) => a - b);

    for (const pos of positions) {
      const human = users.find(
        (u) => u.targetCategory === category && u.targetPosition === pos && u.xp >= 1000
      );
      const bot = getBotForSeat(category, pos);
      const isDisplaced = bot ? localDisplaced.has(bot.id) : true;

      if (human && isDisplaced) {
        finalRoster.push({ category, position: pos, occupant: human.displayName, type: 'HUMAN', score: human.xp });
      } else if (bot && !isDisplaced) {
        finalRoster.push({ category, position: pos, occupant: `[BOT] ${bot.displayName}`, type: 'BOT', score: bot.provisionalScore });
      } else {
        finalRoster.push({ category, position: pos, occupant: 'Open Seat', type: 'BOT', score: 0 });
      }
    }
  }

  const humanSeats = finalRoster.filter((r) => r.type === 'HUMAN').length;
  const botSeats = finalRoster.filter((r) => r.type === 'BOT').length;

  return { totalTicks: ticks, events, finalRoster, displacementsCompleted, humanSeats, botSeats };
}

/** Default simulation users — one per genre to test full-coverage takeover */
export const DEFAULT_SIM_USERS: SimulatedUser[] = [
  { id: 'sim-user-001', displayName: 'RealUser Alpha',    genre: 'Hip-Hop',  xp: 0, targetCategory: 'hip-hop',  targetPosition: 4 },
  { id: 'sim-user-002', displayName: 'RealUser Beta',     genre: 'R&B',      xp: 0, targetCategory: 'rnb',      targetPosition: 3 },
  { id: 'sim-user-003', displayName: 'RealUser Gamma',    genre: 'Pop',      xp: 0, targetCategory: 'pop',      targetPosition: 3 },
  { id: 'sim-user-004', displayName: 'RealUser Delta',    genre: 'Rock',     xp: 0, targetCategory: 'rock',     targetPosition: 2 },
  { id: 'sim-user-005', displayName: 'RealUser Epsilon',  genre: 'Country',  xp: 0, targetCategory: 'country',  targetPosition: 2 },
  { id: 'sim-user-006', displayName: 'RealUser Zeta',     genre: 'Gospel',   xp: 0, targetCategory: 'gospel',   targetPosition: 2 },
  { id: 'sim-user-007', displayName: 'RealUser Eta',      genre: 'EDM',      xp: 0, targetCategory: 'edm',      targetPosition: 2 },
  { id: 'sim-user-008', displayName: 'RealUser Theta',    genre: 'Jazz',     xp: 0, targetCategory: 'jazz',     targetPosition: 2 },
  { id: 'sim-user-009', displayName: 'RealUser Iota',     genre: 'Comedy',   xp: 0, targetCategory: 'comedy',   targetPosition: 2 },
  { id: 'sim-user-010', displayName: 'RealUser Kappa',    genre: 'Dance',    xp: 0, targetCategory: 'dance',    targetPosition: 2 },
  { id: 'sim-user-011', displayName: 'RealUser Lambda',   genre: 'Producer', xp: 0, targetCategory: 'producer', targetPosition: 2 },
  { id: 'sim-user-012', displayName: 'RealUser Mu',       genre: 'Latin',    xp: 0, targetCategory: 'latin',    targetPosition: 2 },
  { id: 'sim-user-013', displayName: 'Overall Challenger',genre: 'All',      xp: 0, targetCategory: 'overall',  targetPosition: 2 },
];
