/**
 * Inter-module contract for BerntoutGlobal XXL.
 * The admin module uses this to send control commands to the program runtime.
 */

export type XXLControlCommand =
  | { action: "BOOT" }
  | { action: "STOP" }
  | { action: "RESTART" }
  | { action: "FREEZE" }
  | { action: "THAW" }
  | { action: "ISOLATE" }
  | { action: "EMERGENCY_LOCK"; reason: string }
  | { action: "SET_KIOSK_MODE"; mode: "KIOSK" | "KIOSK-LOWPOWER" | "WALLBOARD" | "NORMAL" }
  | { action: "SET_STIM_MODE"; mode: "QUIET" | "NORMAL" | "STRESS" | "CHAOS" };

export interface XXLStatusReport {
  moduleId: "xxl";
  state: string;
  uptimeMs: number;
  redisConnected: boolean;
  memoryRssMb: number;
  queueDepth: number;
  kioskMode: string;
  timestamp: number;
}

export interface XXLServiceAdapter {
  sendCommand(cmd: XXLControlCommand): Promise<{ accepted: boolean }>;
  getStatus(): Promise<XXLStatusReport>;
}
