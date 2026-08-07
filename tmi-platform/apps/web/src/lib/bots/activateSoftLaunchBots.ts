import { activateDefaultBots, getHealthSummary, type ActiveBot } from "@/lib/bots/BotActivationEngine";
import { PHASE_1_BOTS } from "@/lib/bots/Phase1LaunchConfig";
import { PERMANENT_BOT_REGISTRY, getActiveBots } from "@/lib/bots/botDutyRegistry";
import { setBotStatus } from "@/lib/bots/permanentBotOperationsEngine";

export const SOFT_LAUNCH_DUTY_BOT_IDS = [
  "welcome-bot-001",
  "mod-bot-001",
  "helper-bot-001",
  "route-watcher-001",
  "hype-bot-001",
  "dev-audit-bot-001",
] as const;

let _softLaunchDutiesArmed = false;

export function activateSoftLaunchBots(): {
  namedBots: ActiveBot[];
  dutyBotsActive: number;
  phase1: typeof PHASE_1_BOTS;
  health: ReturnType<typeof getHealthSummary>;
} {
  const namedBots = activateDefaultBots();
  if (!_softLaunchDutiesArmed) {
    for (const botId of SOFT_LAUNCH_DUTY_BOT_IDS) {
      const entry = PERMANENT_BOT_REGISTRY.find((b) => b.botId === botId);
      if (!entry) continue;
      if (entry.status === "suspended" || entry.status === "paused") continue;
      if (entry.status !== "on-duty") {
        setBotStatus(botId, "on-duty", "soft-launch-activation");
      }
    }
    _softLaunchDutiesArmed = true;
  }
  return {
    namedBots,
    dutyBotsActive: getActiveBots().length,
    phase1: PHASE_1_BOTS,
    health: getHealthSummary(),
  };
}

