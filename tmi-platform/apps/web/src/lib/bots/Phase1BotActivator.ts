/**
 * Phase 1 Bot Activator — single activation point for controlled public launch.
 * Starts Welcome Bot + Ghost Force V1 drip for a given room.
 * Reads PHASE_1_BOTS manifest; respects phase gate.
 * Returns a cleanup function — call it on room unmount.
 */

import { PHASE_1_BOTS, PHASE_1_GHOST_BOT_MAX, isRoomActivePhase1 } from "./Phase1LaunchConfig";
import { getWelcomeMessage } from "./WelcomeBotEngine";
import { startGhostForceV1, type GhostBotCallbacks } from "./BotDripEmitter";

export interface Phase1ActivatorCallbacks {
  /** Welcome message for the entering fan (fires once per user per context) */
  onWelcome: (text: string) => void;
  /** Ghost bot sent a chat line */
  onBotChat: (botName: string, text: string) => void;
  /** Ghost bot triggered a hype action (like/vote animation) */
  onBotHype: (botName: string) => void;
  /** Ghost bot tipped the performer */
  onBotTip: (botName: string) => void;
  /** Diagnostic/logging line (silent in production UI, logged to console) */
  onDiag: (msg: string) => void;
}

/**
 * Activate Phase 1 bots for a fan entering a room.
 *
 * @param roomId - Must be in PHASE_1_ACTIVE_ROOMS or bots won't start.
 * @param fanId  - Used to deduplicate the welcome message.
 * @param cbs    - Callbacks that wire bot output into the room's UI/state.
 * @returns Cleanup function — call on component unmount or room exit.
 */
export function activatePhase1Bots(
  roomId: string,
  fanId: string,
  cbs: Phase1ActivatorCallbacks,
): () => void {
  const cleanups: Array<() => void> = [];

  if (!isRoomActivePhase1(roomId)) {
    cbs.onDiag(`[Phase1] Room ${roomId} is not in Phase 1 active set — bots skipped.`);
    return () => {};
  }

  // Welcome bot — fires once per fan per room entry context
  if (PHASE_1_BOTS.welcomeBot) {
    const msg = getWelcomeMessage(fanId, "room-enter");
    if (msg) {
      // Slight delay so the UI is mounted before the message appears
      const t = setTimeout(() => cbs.onWelcome(msg.text), 1200);
      cleanups.push(() => clearTimeout(t));
    }
  }

  // Ghost Force V1 — controlled chat drip (max PHASE_1_GHOST_BOT_MAX bots)
  if (PHASE_1_BOTS.ghostForceDrip) {
    const ghostCallbacks: GhostBotCallbacks = {
      onChat: cbs.onBotChat,
      onHype: cbs.onBotHype,
      onTip: cbs.onBotTip,
      onDiag: PHASE_1_BOTS.loggingSentinel ? cbs.onDiag : () => {},
    };

    // Override BotDripEmitter's internal MAX_BOTS via wrapper if needed
    // (BotDripEmitter is already capped at 3; Phase1 reduces to PHASE_1_GHOST_BOT_MAX=2)
    let botsStarted = 0;
    const wrappedCallbacks: GhostBotCallbacks = {
      ...ghostCallbacks,
      onChat: (name, text) => {
        if (botsStarted < PHASE_1_GHOST_BOT_MAX) {
          botsStarted++;
          ghostCallbacks.onChat(name, text);
        }
      },
    };

    const stopGhost = startGhostForceV1(roomId, wrappedCallbacks);
    cleanups.push(stopGhost);

    if (PHASE_1_BOTS.loggingSentinel) {
      cbs.onDiag(`[Phase1] GhostForce started — room: ${roomId}, cap: ${PHASE_1_GHOST_BOT_MAX}`);
    }
  }

  return () => cleanups.forEach((fn) => fn());
}
