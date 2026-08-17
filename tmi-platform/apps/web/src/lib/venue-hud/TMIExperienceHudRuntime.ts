/**
 * TMI Experience HUD Runtime — Master Runtime & Command Bus.
 *
 * User-facing System Name: TMI Interactive Venue HUD
 * Core Universal Module: Base Live HUD
 * Technical Engine: TMI Experience HUD Runtime
 *
 * Laws:
 *   1. Experience controls map directly over the active Media Player / Monitor / Venue Viewport.
 *   2. Pre-live centered console contracts into perimeter HUD rails without replacing the 3D scene.
 *   3. Clean stage (CLEAN_STAGE) preserves a permanent HUD Recall Control ([ ◰ HUD ]) in top-right edge.
 *   4. Command Bus executes all actions through one unified input router (touch, mouse, keyboard, gamepad).
 *   5. Controls without a working command are never rendered.
 */

export type ExperienceType =
  | "BATTLE"
  | "WORLD_CONCERT"
  | "WORLD_RELEASE"
  | "LIVE"
  | "CYPHER"
  | "CHALLENGE"
  | "GAME_SHOW"
  | "LOUNGE"
  | "LISTENING_PARTY";

export type UserRoleCapability = "fan" | "performer" | "host" | "judge" | "admin";

export type HudPresentationState =
  | "PRE_LIVE"
  | "CONNECTING"
  | "LIVE_VISIBLE"
  | "LIVE_DIMMED"
  | "CLEAN_STAGE"
  | "PANEL_OPEN"
  | "INTERMISSION"
  | "ENDING"
  | "ENDED"
  | "ERROR";

export type BroadcastState =
  | "IDLE"
  | "PREPARING"
  | "CONNECTING"
  | "LIVE"
  | "PAUSED"
  | "RECONNECTING"
  | "ENDING"
  | "ENDED"
  | "ERROR";

export interface HudCommandPayload {
  actionId: string;
  userId?: string;
  roomId?: string;
  params?: Record<string, any>;
}

export type CommandHandler = (payload: HudCommandPayload) => Promise<boolean> | boolean;

class HudCommandBusImpl {
  private handlers = new Map<string, CommandHandler>();

  register(actionId: string, handler: CommandHandler): () => void {
    this.handlers.set(actionId, handler);
    return () => {
      if (this.handlers.get(actionId) === handler) {
        this.handlers.delete(actionId);
      }
    };
  }

  async execute(actionId: string, payload?: Omit<HudCommandPayload, "actionId">): Promise<boolean> {
    const handler = this.handlers.get(actionId);
    if (!handler) {
      console.warn(`[HudCommandBus] No command handler registered for actionId: ${actionId}`);
      return false;
    }
    try {
      return await handler({ actionId, ...payload });
    } catch (err) {
      console.error(`[HudCommandBus] Error executing command ${actionId}:`, err);
      return false;
    }
  }

  hasHandler(actionId: string): boolean {
    return this.handlers.has(actionId);
  }
}

export const HudCommandBus = new HudCommandBusImpl();

export interface ExperienceHudConfig {
  experienceType: ExperienceType;
  role: UserRoleCapability;
  roomId: string;
  title: string;
  tier: "FREE" | "PRO" | "RUBY" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND";
  isLive: boolean;
  viewerCount: number;
  reactionCount: number;
}

export function resolveHudCapabilities(role: UserRoleCapability) {
  const isPerformerOrHigher = role === "performer" || role === "host" || role === "admin";
  return {
    canGoLive: isPerformerOrHigher,
    canEndLive: isPerformerOrHigher,
    canMuteAudio: true,
    canToggleCamera: isPerformerOrHigher,
    canSwitchSource: isPerformerOrHigher,
    canInviteGuests: isPerformerOrHigher,
    canReact: true,
    canChat: true,
    canFollow: role === "fan",
    canShare: true,
    canRecord: isPerformerOrHigher,
    canModerate: role === "host" || role === "admin",
  };
}
