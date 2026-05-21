export type ClickableIntent = "route" | "panel" | "system-action" | "locked";

export type ClickableTarget = {
  id: string;
  label: string;
  href?: string;
  panelId?: string;
  actionId?: string;
  lockedReason?: string;
};

export type ClickabilityResult = {
  id: string;
  intent: ClickableIntent;
  resolvedTarget: string;
  lockedReason?: string;
};

export function enforceClickability(target: ClickableTarget): ClickabilityResult {
  if (target.href) {
    return {
      id: target.id,
      intent: "route",
      resolvedTarget: target.href,
    };
  }

  if (target.panelId) {
    return {
      id: target.id,
      intent: "panel",
      resolvedTarget: target.panelId,
    };
  }

  if (target.actionId) {
    return {
      id: target.id,
      intent: "system-action",
      resolvedTarget: target.actionId,
    };
  }

  return {
    id: target.id,
    intent: "locked",
    resolvedTarget: "LOCKED",
    lockedReason: target.lockedReason ?? "No valid route, panel, or action target configured.",
  };
}

export function enforceClickabilityBatch(targets: ClickableTarget[]): ClickabilityResult[] {
  return targets.map(enforceClickability);
}
