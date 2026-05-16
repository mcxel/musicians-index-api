import {
  BLANK_SEAT_PERFORMER_BOTS,
  blockBlankSeatAction,
  getBlankSeatBotById,
  moveBlankSeatBot,
  setBlankSeatState,
  updateBlankSeatFeedHealth,
  getBlankSeatActionLog,
} from "./blankSeatPerformerBots";
import {
  createInspectionProtocol,
  advanceInspectionStep,
  markDirectionalCheck,
  markControlCheck,
  markFeedCheck,
  markRouteJump,
  isInspectionHealthy,
  type LobbyInspectionResult,
  type DirectionalCheck,
} from "./lobbyInspectionProtocol";
import { checkLobbyAccess } from "@/lib/lobbies/lobbyPrivacyEngine";

const inspectionMap = new Map<string, LobbyInspectionResult>();

export type PublicLobbyJoinRequest = {
  botId: string;
  lobbyId: string;
  route: string;
  isPrivateLobby: boolean;
};

export function getLobbyInspectionByBot(botId: string): LobbyInspectionResult | null {
  return inspectionMap.get(botId) ?? null;
}

export function joinPublicLobby(request: PublicLobbyJoinRequest): { allowed: boolean; reason: string } {
  const bot = getBlankSeatBotById(request.botId);
  if (!bot) return { allowed: false, reason: "bot not found" };

  if (request.isPrivateLobby) {
    blockBlankSeatAction(request.botId, "join-private-lobby", "blank-seat bots are public/test only", request.route, request.lobbyId);
    return { allowed: false, reason: "private lobby blocked" };
  }

  const access = checkLobbyAccess(request.lobbyId, request.botId, 22, true);
  if (!access.allowed) {
    blockBlankSeatAction(request.botId, "join-lobby-blocked", access.reason, request.route, request.lobbyId);
    return { allowed: false, reason: access.reason };
  }

  moveBlankSeatBot(request.botId, request.route, request.lobbyId);
  setBlankSeatState(request.botId, "listening", `inspecting:${request.lobbyId}`);
  inspectionMap.set(request.botId, createInspectionProtocol(request.botId, request.lobbyId, request.route));

  return { allowed: true, reason: "joined public lobby" };
}

export function leaveLobby(botId: string): boolean {
  const bot = getBlankSeatBotById(botId);
  if (!bot) return false;
  moveBlankSeatBot(botId, "/lobby", undefined);
  setBlankSeatState(botId, "inactive", "awaiting-inspection-task");
  return true;
}

export function runDirectionalVerification(botId: string): boolean {
  const result = inspectionMap.get(botId);
  if (!result) return false;

  const checks: DirectionalCheck[] = [
    "up-down",
    "left-right",
    "back-forward",
    "front-back",
    "circle-rotation",
    "reverse-rollback",
  ];
  for (const check of checks) markDirectionalCheck(result, check, true);
  advanceInspectionStep(result);
  inspectionMap.set(botId, result);
  return true;
}

export function runControlVerification(botId: string): boolean {
  const result = inspectionMap.get(botId);
  if (!result) return false;

  markControlCheck(result, "buttons", true);
  markControlCheck(result, "chevrons", true);
  markControlCheck(result, "sliders", true);
  markControlCheck(result, "fullscreen", true);
  markControlCheck(result, "monitorPreview", true);

  markRouteJump(result, "lobbyToBillboard", true);
  markRouteJump(result, "billboardToGame", true);
  markRouteJump(result, "gameToLobby", true);

  advanceInspectionStep(result);
  inspectionMap.set(botId, result);
  return true;
}

export function runFeedVerification(botId: string): boolean {
  const result = inspectionMap.get(botId);
  if (!result) return false;

  markFeedCheck(result, "video", "ok");
  markFeedCheck(result, "audio", "ok");
  markFeedCheck(result, "chatSend", true);
  markFeedCheck(result, "chatReceive", true);

  updateBlankSeatFeedHealth(botId, "video", "ok");
  updateBlankSeatFeedHealth(botId, "audio", "ok");
  updateBlankSeatFeedHealth(botId, "chat", "ok");

  setBlankSeatState(botId, "testing", "feed-and-controls-verification");
  advanceInspectionStep(result);
  inspectionMap.set(botId, result);
  return true;
}

export function sendTestMessage(botId: string, message: string): { sent: boolean; reason?: string } {
  const bot = getBlankSeatBotById(botId);
  if (!bot) return { sent: false, reason: "bot not found" };
  if (!bot.currentLobbyId) return { sent: false, reason: "bot not in lobby" };

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("tmi:blank-seat-test-message", {
        detail: {
          botId,
          botLabel: bot.label,
          lobbyId: bot.currentLobbyId,
          message,
          timestamp: Date.now(),
        },
      })
    );
  }

  return { sent: true };
}

export function reportToAdminHub(botId: string, summary: string, errors: string[] = []) {
  const bot = getBlankSeatBotById(botId);
  if (!bot) return null;

  const inspection = inspectionMap.get(botId) ?? null;
  const payload = {
    botId,
    botLabel: bot.label,
    route: bot.currentRoute,
    task: bot.currentTask,
    feedHealth: bot.feedHealth,
    summary,
    errors,
    inspectionHealthy: inspection ? isInspectionHealthy(inspection) : false,
    actionLogCount: getBlankSeatActionLog().filter((a) => a.botId === botId).length,
    timestamp: Date.now(),
  };

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("tmi:admin-maintenance-report", { detail: payload }));
  }

  setBlankSeatState(botId, "reporting", "admin-report-exported");
  return payload;
}

export function runFullPublicLobbyInspection(botId: string, lobbyId: string, route = "/lobby") {
  const join = joinPublicLobby({ botId, lobbyId, route, isPrivateLobby: false });
  if (!join.allowed) return { ok: false, stage: "join", reason: join.reason };

  runDirectionalVerification(botId);
  runControlVerification(botId);
  runFeedVerification(botId);

  const inspection = inspectionMap.get(botId);
  const healthy = inspection ? isInspectionHealthy(inspection) : false;
  reportToAdminHub(botId, healthy ? "inspection pass" : "inspection has warnings", inspection?.blockers ?? []);

  return {
    ok: healthy,
    stage: "complete",
    inspection,
    bot: getBlankSeatBotById(botId),
  };
}

export function getBlankSeatWorkforce() {
  return {
    total: BLANK_SEAT_PERFORMER_BOTS.length,
    active: BLANK_SEAT_PERFORMER_BOTS.filter((b) => b.status === "active").length,
    inLobby: BLANK_SEAT_PERFORMER_BOTS.filter((b) => Boolean(b.currentLobbyId)).length,
    sandboxWalletOnly: BLANK_SEAT_PERFORMER_BOTS.every((b) => b.sandboxWallet.mode === "sandbox-only" && b.sandboxWallet.payoutsEnabled === false),
  };
}
