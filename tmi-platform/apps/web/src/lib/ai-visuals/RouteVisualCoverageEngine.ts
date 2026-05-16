import { VisualAutoFillRuntime, type VisualAutoFillKind } from "@/lib/ai-visuals/VisualAutoFillRuntime";

export type RouteVisualCoverageInput = {
  route: string;
  slotId: string;
  kind: VisualAutoFillKind;
  owner: string;
  component: string;
  title: string;
  subtitle: string;
  accent: string;
  secondaryAccent: string;
};

export type RouteVisualCoverageSnapshot = {
  route: string;
  title: string;
  subtitle: string;
  accent: string;
  secondaryAccent: string;
  imageRef: string | null;
  generated: boolean;
  queued: boolean;
  usedStaticFallback: boolean;
};

export function ensureRouteVisualCoverage(input: RouteVisualCoverageInput): RouteVisualCoverageSnapshot {
  const result = VisualAutoFillRuntime.ensureSlot({
    slotId: input.slotId,
    route: input.route,
    component: input.component,
    owner: input.owner,
    kind: input.kind,
    priority: "high",
    badge: "FEATURED",
  });

  return {
    route: input.route,
    title: input.title,
    subtitle: input.subtitle,
    accent: input.accent,
    secondaryAccent: input.secondaryAccent,
    imageRef: result.imageRef,
    generated: result.generated,
    queued: result.queued,
    usedStaticFallback: result.usedStaticFallback,
  };
}