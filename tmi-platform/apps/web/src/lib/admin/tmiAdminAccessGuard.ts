export type TmiAdminRole = "owner" | "admin" | "bot";

export type TmiAdminCapability =
  | "overseer-deck"
  | "observation"
  | "route-jump"
  | "voice-command"
  | "text-command"
  | "destructive-command"
  | "telemetry-only";

const ROLE_CAPABILITIES: Record<TmiAdminRole, TmiAdminCapability[]> = {
  owner: [
    "overseer-deck",
    "observation",
    "route-jump",
    "voice-command",
    "text-command",
    "destructive-command",
    "telemetry-only",
  ],
  admin: ["observation", "route-jump", "telemetry-only"],
  bot: ["telemetry-only"],
};

export function canAccessCapability(role: TmiAdminRole, capability: TmiAdminCapability): boolean {
  return ROLE_CAPABILITIES[role]?.includes(capability) ?? false;
}

export function assertOwnerAccess(role: TmiAdminRole): { allowed: boolean; reason?: string } {
  if (role !== "owner") {
    return { allowed: false, reason: "Owner-only control" };
  }
  return { allowed: true };
}
