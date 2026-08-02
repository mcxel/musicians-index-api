/**
 * AutomationRegistry — Living OS workflow catalog.
 *
 * Reuses livingOsCommandBus + universalActionRegistry. Does NOT invent a second bus.
 * Only RELEASE_NEW_WORK has a real step runner this pass; others are COMING_SOON.
 */

export type AutomationWorkflowId =
  | "RELEASE_NEW_WORK"
  | "PUBLISH_MAGAZINE"
  | "CREATE_YOPHO"
  | "START_WORLD_PREMIERE"
  | "OPEN_BEAT_AUCTION"
  | "LAUNCH_BATTLE"
  | "PUBLISH_INTERVIEW"
  | "ANNOUNCE_WORLD_TOUR"
  | "DROP_COLLECTIBLE_SET"
  | "START_MEMBERSHIP_CAMPAIGN";

export type AutomationImplStatus = "ACTIVE" | "COMING_SOON";

export interface AutomationWorkflowDef {
  id: AutomationWorkflowId;
  label: string;
  description: string;
  /** Honest implementation status — Rule 20. */
  status: AutomationImplStatus;
  /** Action Registry id when wired through executeAction. */
  actionId?: string;
  /** Ordered step ids for ACTIVE workflows. */
  stepIds?: string[];
}

export const RELEASE_NEW_WORK_STEPS = [
  "validate_assets",
  "create_commerce_product",
  "distributor_sync",
  "magazine",
  "yopho",
  "store_update",
  "listening_party",
  "notify_followers",
  "analytics_init",
] as const;

export type ReleaseNewWorkStepId = (typeof RELEASE_NEW_WORK_STEPS)[number];

export const AUTOMATION_REGISTRY: Record<AutomationWorkflowId, AutomationWorkflowDef> = {
  RELEASE_NEW_WORK: {
    id: "RELEASE_NEW_WORK",
    label: "Release New Work",
    description:
      "Validate assets → commerce product → distributor (honest skip/queue) → magazine → YoPho → store → listening party → notify → analytics.",
    status: "ACTIVE",
    actionId: "ACTION_RUN_RELEASE_NEW_WORK",
    stepIds: [...RELEASE_NEW_WORK_STEPS],
  },
  PUBLISH_MAGAZINE: {
    id: "PUBLISH_MAGAZINE",
    label: "Publish Magazine",
    description: "Auto-publish a magazine feature for a release. Not implemented this pass.",
    status: "COMING_SOON",
  },
  CREATE_YOPHO: {
    id: "CREATE_YOPHO",
    label: "Create YoPho",
    description: "Standalone YoPho edition workflow. Use YoPho Studio / ACTION_PUBLISH_YOPHO for now.",
    status: "COMING_SOON",
  },
  START_WORLD_PREMIERE: {
    id: "START_WORLD_PREMIERE",
    label: "Start World Premiere",
    description: "World Premiere live event automation. Deferred — no fake rooms.",
    status: "COMING_SOON",
  },
  OPEN_BEAT_AUCTION: {
    id: "OPEN_BEAT_AUCTION",
    label: "Open Beat Auction",
    description: "Beat auction lifecycle. Deferred.",
    status: "COMING_SOON",
  },
  LAUNCH_BATTLE: {
    id: "LAUNCH_BATTLE",
    label: "Launch Battle",
    description: "Battle overlay / Mini Battle creation. Deferred — no battle overlays this pass.",
    status: "COMING_SOON",
  },
  PUBLISH_INTERVIEW: {
    id: "PUBLISH_INTERVIEW",
    label: "Publish Interview",
    description: "Interview magazine path. Deferred — no full magazine auto-writer.",
    status: "COMING_SOON",
  },
  ANNOUNCE_WORLD_TOUR: {
    id: "ANNOUNCE_WORLD_TOUR",
    label: "Announce World Tour",
    description: "Tour announcement cascade. Deferred.",
    status: "COMING_SOON",
  },
  DROP_COLLECTIBLE_SET: {
    id: "DROP_COLLECTIBLE_SET",
    label: "Drop Collectible Set",
    description: "Multi-edition collectible drop. Deferred.",
    status: "COMING_SOON",
  },
  START_MEMBERSHIP_CAMPAIGN: {
    id: "START_MEMBERSHIP_CAMPAIGN",
    label: "Start Membership Campaign",
    description: "Fan-club / membership campaign. Deferred until Stripe memberships connect.",
    status: "COMING_SOON",
  },
};

export function getAutomationWorkflow(
  id: AutomationWorkflowId,
): AutomationWorkflowDef | null {
  return AUTOMATION_REGISTRY[id] ?? null;
}

export function listAutomationWorkflows(): AutomationWorkflowDef[] {
  return Object.values(AUTOMATION_REGISTRY);
}

export function listActiveAutomationWorkflows(): AutomationWorkflowDef[] {
  return listAutomationWorkflows().filter((w) => w.status === "ACTIVE");
}

export function isWorkflowRunnable(id: AutomationWorkflowId): boolean {
  return AUTOMATION_REGISTRY[id]?.status === "ACTIVE";
}
