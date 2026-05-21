import type { ModuleEvent } from "@tmi/module-runtime";

export interface XXLRuntimeStatusEvent {
  redisConnected: boolean;
  uptimeSeconds: number;
  memoryRssMb: number;
  queueDepth: number;
  moduleState: string;
}

export interface XXLKioskModeChanged {
  previousMode: string;
  newMode: "KIOSK" | "KIOSK-LOWPOWER" | "WALLBOARD" | "NORMAL";
  triggeredBy: "url_param" | "admin" | "auto";
}

export interface XXLModuleStatusChanged {
  moduleId: string;
  status: "ONLINE" | "OFFLINE" | "DEGRADED";
  previousStatus: string;
}

export const XXL_EVENT_TYPES = {
  RUNTIME_STATUS:    "xxl.runtime.status",
  MODULE_ONLINE:     "xxl.module.online",
  MODULE_OFFLINE:    "xxl.module.offline",
  KIOSK_MODE_CHANGED: "xxl.kiosk.mode_changed",
} as const;

export type XXLEvent =
  | ModuleEvent<XXLRuntimeStatusEvent>
  | ModuleEvent<XXLKioskModeChanged>
  | ModuleEvent<XXLModuleStatusChanged>;
