/**
 * Interaction Command Bus — thin typed dispatcher for gradual button adoption.
 *
 * Does NOT mass-migrate every control. Existing HudCommandBus and
 * PersonalMediaCommandBus remain canonical for their domains.
 *
 * 1-Action UX law:
 *   - reversible → may optimistic-echo then confirm
 *   - payments / ownership / safety → wait for server authority (never optimistic)
 */

import { HudCommandBus } from "@/lib/venue-hud/TMIExperienceHudRuntime";

export type CommandAuthority = "local" | "server";

export type InteractionCommandKind =
  | "UI.NAVIGATE"
  | "UI.OPEN_PANEL"
  | "UI.CLOSE_PANEL"
  | "MEDIA.PRIMARY_AUDIO"
  | "ROOM.REQUEST_HANDOFF"
  | "HUD.EXECUTE"
  | "PAYMENT.CHECKOUT"
  | "OWNERSHIP.CLAIM"
  | "SAFETY.REPORT";

export type InteractionCommand = {
  kind: InteractionCommandKind;
  /** Server-authoritative kinds must not optimistic-apply valuable state. */
  authority: CommandAuthority;
  reversible: boolean;
  payload?: Record<string, unknown>;
};

export type InteractionCommandResult = {
  ok: boolean;
  optimisticApplied: boolean;
  deferredToServer: boolean;
  reason?: string;
};

type Handler = (cmd: InteractionCommand) => Promise<InteractionCommandResult> | InteractionCommandResult;

const handlers = new Map<InteractionCommandKind, Handler>();

const SERVER_ONLY: ReadonlySet<InteractionCommandKind> = new Set([
  "PAYMENT.CHECKOUT",
  "OWNERSHIP.CLAIM",
  "SAFETY.REPORT",
]);

export function registerInteractionCommand(
  kind: InteractionCommandKind,
  handler: Handler,
): () => void {
  handlers.set(kind, handler);
  return () => {
    if (handlers.get(kind) === handler) handlers.delete(kind);
  };
}

/**
 * Dispatch a typed interaction command.
 * Payments/ownership/safety never apply optimistic valuable state.
 */
export async function dispatchInteractionCommand(
  cmd: InteractionCommand,
): Promise<InteractionCommandResult> {
  if (SERVER_ONLY.has(cmd.kind) || cmd.authority === "server") {
    const handler = handlers.get(cmd.kind);
    if (!handler) {
      return {
        ok: false,
        optimisticApplied: false,
        deferredToServer: true,
        reason: `No server handler for ${cmd.kind} — valuable state waits for authority.`,
      };
    }
    const result = await handler({ ...cmd, authority: "server", reversible: false });
    return { ...result, optimisticApplied: false, deferredToServer: true };
  }

  if (cmd.kind === "HUD.EXECUTE") {
    const actionId = typeof cmd.payload?.actionId === "string" ? cmd.payload.actionId : null;
    if (!actionId) {
      return {
        ok: false,
        optimisticApplied: false,
        deferredToServer: false,
        reason: "HUD.EXECUTE requires payload.actionId",
      };
    }
    const ok = await HudCommandBus.execute(actionId, {
      params: (cmd.payload?.params as Record<string, unknown> | undefined) ?? undefined,
    });
    return {
      ok,
      optimisticApplied: cmd.reversible && ok,
      deferredToServer: false,
    };
  }

  const handler = handlers.get(cmd.kind);
  if (!handler) {
    return {
      ok: false,
      optimisticApplied: false,
      deferredToServer: false,
      reason: `No handler registered for ${cmd.kind}`,
    };
  }

  const result = await handler(cmd);
  return {
    ...result,
    optimisticApplied: Boolean(cmd.reversible && result.ok && result.optimisticApplied !== false),
  };
}

export function isOptimisticAllowed(cmd: Pick<InteractionCommand, "kind" | "authority" | "reversible">): boolean {
  if (SERVER_ONLY.has(cmd.kind) || cmd.authority === "server") return false;
  return cmd.reversible === true;
}
