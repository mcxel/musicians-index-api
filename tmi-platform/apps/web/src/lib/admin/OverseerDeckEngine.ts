/**
 * OverseerDeckEngine
 * Platform-wide admin command interface — aggregates live metrics, dispatches commands.
 */

export type OverseerAlertLevel = "info" | "warning" | "critical";

export type OverseerAlert = {
  alertId: string;
  level: OverseerAlertLevel;
  message: string;
  source: string;
  createdAtMs: number;
  resolvedAtMs: number | null;
  resolved: boolean;
};

export type PlatformMetrics = {
  liveViewers: number;
  activeShows: number;
  activeLobbies: number;
  activeBots: number;
  openTicketOrders: number;
  revenueToday: number;
  revenueThisMonth: number;
  flaggedMessages: number;
  pendingRefunds: number;
  serverHealth: "healthy" | "degraded" | "critical";
  lastUpdatedMs: number;
};

export type OverseerCommand = {
  commandId: string;
  type:
    | "kick_user"
    | "mute_user"
    | "ban_user"
    | "close_show"
    | "force_intermission"
    | "emergency_shutdown"
    | "pause_billing"
    | "clear_flagged_messages"
    | "reload_bots"
    | "custom";
  targetId?: string;
  executedBy: string;
  executedAtMs: number;
  note?: string;
  result: "pending" | "success" | "failed";
};

let _alertSeq = 0;
let _commandSeq = 0;

export class OverseerDeckEngine {
  private metrics: PlatformMetrics = {
    liveViewers: 0,
    activeShows: 0,
    activeLobbies: 0,
    activeBots: 0,
    openTicketOrders: 0,
    revenueToday: 0,
    revenueThisMonth: 0,
    flaggedMessages: 0,
    pendingRefunds: 0,
    serverHealth: "healthy",
    lastUpdatedMs: 0,
  };

  private readonly alerts: OverseerAlert[] = [];
  private readonly commandLog: OverseerCommand[] = [];

  updateMetrics(partial: Partial<Omit<PlatformMetrics, "lastUpdatedMs">>): void {
    Object.assign(this.metrics, partial);
    this.metrics.lastUpdatedMs = Date.now();
  }

  getMetrics(): PlatformMetrics {
    return { ...this.metrics };
  }

  raiseAlert(level: OverseerAlertLevel, message: string, source: string): OverseerAlert {
    const alert: OverseerAlert = {
      alertId: `alert-${Date.now()}-${++_alertSeq}`,
      level,
      message,
      source,
      createdAtMs: Date.now(),
      resolvedAtMs: null,
      resolved: false,
    };
    this.alerts.push(alert);
    return alert;
  }

  resolveAlert(alertId: string): void {
    const alert = this.alerts.find((a) => a.alertId === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAtMs = Date.now();
    }
  }

  getActiveAlerts(): OverseerAlert[] {
    return this.alerts.filter((a) => !a.resolved);
  }

  getCriticalAlerts(): OverseerAlert[] {
    return this.alerts.filter((a) => !a.resolved && a.level === "critical");
  }

  dispatchCommand(
    type: OverseerCommand["type"],
    executedBy: string,
    options?: { targetId?: string; note?: string },
  ): OverseerCommand {
    const command: OverseerCommand = {
      commandId: `cmd-${Date.now()}-${++_commandSeq}`,
      type,
      executedBy,
      targetId: options?.targetId,
      note: options?.note,
      executedAtMs: Date.now(),
      result: "pending",
    };
    this.commandLog.push(command);
    return command;
  }

  resolveCommand(commandId: string, result: "success" | "failed"): void {
    const command = this.commandLog.find((c) => c.commandId === commandId);
    if (command) command.result = result;
  }

  getRecentCommands(limitN: number = 20): OverseerCommand[] {
    return [...this.commandLog].slice(-limitN).reverse();
  }
}

export const overseerDeckEngine = new OverseerDeckEngine();
