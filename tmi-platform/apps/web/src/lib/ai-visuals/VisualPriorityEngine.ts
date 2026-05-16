export type VisualPriority = "critical" | "high" | "medium" | "low";

export type VisualPriorityRuleInput = {
  route: string;
  surface:
    | "homepage"
    | "live-event"
    | "battle"
    | "ticket"
    | "venue"
    | "magazine"
    | "profile"
    | "billboard"
    | "other";
  isLiveNow?: boolean;
  isRevenueCritical?: boolean;
};

export function resolveVisualPriority(input: VisualPriorityRuleInput): VisualPriority {
  if (input.isLiveNow) return "critical";
  if (input.surface === "homepage") return "critical";
  if (input.surface === "live-event" || input.surface === "battle" || input.surface === "ticket" || input.surface === "venue") {
    return "high";
  }
  if (input.isRevenueCritical || input.surface === "billboard") return "high";
  if (input.surface === "magazine" || input.surface === "profile") return "medium";
  return "low";
}
