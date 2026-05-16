import { assertOwnerAccess, type TmiAdminRole } from "@/lib/admin/tmiAdminAccessGuard";

export type TmiVoiceCommand =
  | "jump-route"
  | "open-monitor"
  | "zoom-feed"
  | "summon-big-ace"
  | "lock-system"
  | "unlock-system";

export type TmiVoiceCommandResult = {
  accepted: boolean;
  reason?: string;
  command: TmiVoiceCommand;
  payload?: string;
};

export function runAdminVoiceCommand(
  role: TmiAdminRole,
  command: TmiVoiceCommand,
  payload?: string,
): TmiVoiceCommandResult {
  const owner = assertOwnerAccess(role);
  if (!owner.allowed) {
    return {
      accepted: false,
      reason: owner.reason,
      command,
      payload,
    };
  }

  return {
    accepted: true,
    command,
    payload,
  };
}
