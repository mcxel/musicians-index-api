export const LOBBY_INSPECTION_SEQUENCE = [
  "SEARCH",
  "FIND",
  "VERIFY",
  "ACCEPT",
  "START",
  "VERIFY",
  "COMPLETE",
  "TEST",
  "EXPORT",
  "REPEAT",
] as const;

export type LobbyInspectionStep = (typeof LOBBY_INSPECTION_SEQUENCE)[number];

export type DirectionalCheck =
  | "up-down"
  | "left-right"
  | "back-forward"
  | "front-back"
  | "circle-rotation"
  | "reverse-rollback";

export type LobbyInspectionResult = {
  protocolId: string;
  botId: string;
  lobbyId: string;
  route: string;
  currentStep: LobbyInspectionStep;
  completedSteps: LobbyInspectionStep[];
  directionalChecks: Record<DirectionalCheck, boolean>;
  controls: {
    buttons: boolean;
    chevrons: boolean;
    sliders: boolean;
    fullscreen: boolean;
    monitorPreview: boolean;
  };
  feedHealth: {
    video: "ok" | "degraded" | "down";
    audio: "ok" | "degraded" | "down";
    chatSend: boolean;
    chatReceive: boolean;
  };
  routeJumpChecks: {
    lobbyToBillboard: boolean;
    billboardToGame: boolean;
    gameToLobby: boolean;
  };
  blockers: string[];
  warnings: string[];
  startedAt: number;
  updatedAt: number;
};

let protocolCounter = 1;

export function createInspectionProtocol(botId: string, lobbyId: string, route: string): LobbyInspectionResult {
  return {
    protocolId: `LIP-${String(protocolCounter++).padStart(5, "0")}`,
    botId,
    lobbyId,
    route,
    currentStep: "SEARCH",
    completedSteps: [],
    directionalChecks: {
      "up-down": false,
      "left-right": false,
      "back-forward": false,
      "front-back": false,
      "circle-rotation": false,
      "reverse-rollback": false,
    },
    controls: {
      buttons: false,
      chevrons: false,
      sliders: false,
      fullscreen: false,
      monitorPreview: false,
    },
    feedHealth: {
      video: "ok",
      audio: "ok",
      chatSend: false,
      chatReceive: false,
    },
    routeJumpChecks: {
      lobbyToBillboard: false,
      billboardToGame: false,
      gameToLobby: false,
    },
    blockers: [],
    warnings: [],
    startedAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function advanceInspectionStep(result: LobbyInspectionResult): LobbyInspectionResult {
  const currentIndex = LOBBY_INSPECTION_SEQUENCE.indexOf(result.currentStep);
  result.completedSteps.push(result.currentStep);
  result.currentStep =
    currentIndex >= LOBBY_INSPECTION_SEQUENCE.length - 1
      ? "REPEAT"
      : LOBBY_INSPECTION_SEQUENCE[currentIndex + 1];
  result.updatedAt = Date.now();
  return result;
}

export function markDirectionalCheck(
  result: LobbyInspectionResult,
  direction: DirectionalCheck,
  pass: boolean
): LobbyInspectionResult {
  result.directionalChecks[direction] = pass;
  if (!pass) result.blockers.push(`Directional check failed: ${direction}`);
  result.updatedAt = Date.now();
  return result;
}

export function markControlCheck(
  result: LobbyInspectionResult,
  key: keyof LobbyInspectionResult["controls"],
  pass: boolean
): LobbyInspectionResult {
  result.controls[key] = pass;
  if (!pass) result.blockers.push(`Control check failed: ${key}`);
  result.updatedAt = Date.now();
  return result;
}

export function markFeedCheck(
  result: LobbyInspectionResult,
  key: keyof LobbyInspectionResult["feedHealth"],
  value: LobbyInspectionResult["feedHealth"][keyof LobbyInspectionResult["feedHealth"]]
): LobbyInspectionResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (result.feedHealth as any)[key] = value;
  if (value === "down" || value === false) {
    result.warnings.push(`Feed check warning: ${String(key)}=${String(value)}`);
  }
  result.updatedAt = Date.now();
  return result;
}

export function markRouteJump(
  result: LobbyInspectionResult,
  key: keyof LobbyInspectionResult["routeJumpChecks"],
  pass: boolean
): LobbyInspectionResult {
  result.routeJumpChecks[key] = pass;
  if (!pass) result.blockers.push(`Route jump failed: ${key}`);
  result.updatedAt = Date.now();
  return result;
}

export function isInspectionHealthy(result: LobbyInspectionResult): boolean {
  const directionsPass = Object.values(result.directionalChecks).every(Boolean);
  const controlsPass = Object.values(result.controls).every(Boolean);
  const routePass = Object.values(result.routeJumpChecks).every(Boolean);
  const feedPass =
    result.feedHealth.video !== "down" &&
    result.feedHealth.audio !== "down" &&
    result.feedHealth.chatSend &&
    result.feedHealth.chatReceive;
  return directionsPass && controlsPass && routePass && feedPass && result.blockers.length === 0;
}
