/**
 * Admin Concierge destination ledger — former top horizontal "Admin Quick Switch"
 * oval bar destinations, searchable in AdminConciergePanel.
 *
 * Rule 20: labels and hrefs only — no fake counts/badges.
 */

export type ConciergeActionId = "suggest-fix";

export type ConciergeDestination = {
  id: string;
  label: string;
  href?: string;
  action?: ConciergeActionId;
  group: ConciergeGroup;
  keywords?: string[];
  accent?: string;
};

export type ConciergeGroup =
  | "Command Deck"
  | "Dashboards"
  | "Ops Intelligence"
  | "Account"
  | "Workspaces";

/** Former sticky Admin Quick Switch destinations (real routes only). */
export const ADMIN_CONCIERGE_DESTINATIONS: ConciergeDestination[] = [
  {
    id: "overseer",
    label: "Overseer Deck",
    href: "/admin/overseer",
    group: "Command Deck",
    accent: "#FFD700",
    keywords: ["flight", "observatory", "command"],
  },
  {
    id: "runtime-check",
    label: "Runtime Check",
    href: "/admin/runtime-check",
    group: "Command Deck",
    accent: "#00FF88",
    keywords: ["health", "certify"],
  },
  {
    id: "certification",
    label: "Certification",
    href: "/admin/certification",
    group: "Command Deck",
    accent: "#FFD700",
    keywords: ["qa", "pass", "fail"],
  },
  {
    id: "observatory",
    label: "Observatory",
    href: "/admin/observatory",
    group: "Command Deck",
    accent: "#00FFFF",
    keywords: ["observe", "deck"],
  },
  {
    id: "fan-page",
    label: "Fan Page",
    href: "/dashboard/fan",
    group: "Dashboards",
    accent: "#00FF88",
    keywords: ["fan", "lobby"],
  },
  {
    id: "performer-page",
    label: "Performer Page",
    href: "/dashboard/performer",
    group: "Dashboards",
    accent: "#FF2DAA",
    keywords: ["artist", "performer"],
  },
  {
    id: "global-pulse",
    label: "Global Pulse",
    href: "/admin/global-pulse",
    group: "Ops Intelligence",
    accent: "#AA2DFF",
  },
  {
    id: "venue-health",
    label: "Venue Health",
    href: "/admin/venue-health",
    group: "Ops Intelligence",
    accent: "#00FF88",
  },
  {
    id: "world-memory",
    label: "World Memory",
    href: "/admin/world-memory",
    group: "Ops Intelligence",
    accent: "#FFD700",
  },
  {
    id: "humanity-test",
    label: "Humanity Test",
    href: "/admin/humanity-benchmark",
    group: "Ops Intelligence",
    accent: "#AA2DFF",
    keywords: ["benchmark", "humanity"],
  },
  {
    id: "social-graph",
    label: "Social Graph",
    href: "/admin/social-graph",
    group: "Ops Intelligence",
    accent: "#FF2DAA",
  },
  {
    id: "dynamics-deck",
    label: "Dynamics Deck",
    href: "/admin/social-dynamics",
    group: "Ops Intelligence",
    accent: "#00FF88",
    keywords: ["social", "dynamics"],
  },
  {
    id: "mythology",
    label: "Mythology",
    href: "/admin/mythology",
    group: "Ops Intelligence",
    accent: "#FFD700",
  },
  {
    id: "world-premiere",
    label: "World Premiere",
    href: "/admin/world-premiere",
    group: "Ops Intelligence",
    accent: "#FF2DAA",
  },
  {
    id: "bench-history",
    label: "Bench History",
    href: "/admin/benchmark-history",
    group: "Ops Intelligence",
    accent: "#00FF88",
    keywords: ["benchmark", "history"],
  },
  {
    id: "account",
    label: "Account",
    href: "/account",
    group: "Account",
    accent: "rgba(255,255,255,0.7)",
  },
  {
    id: "suggest-fix",
    label: "Suggest Fix",
    action: "suggest-fix",
    group: "Account",
    accent: "#00FFFF",
    keywords: ["fix", "intake", "auto"],
  },
  {
    id: "admin-home",
    label: "Admin Home",
    href: "/admin",
    group: "Command Deck",
    accent: "#FFD700",
    keywords: ["hub", "home"],
  },
  {
    id: "revenue",
    label: "Revenue",
    href: "/admin/revenue",
    group: "Ops Intelligence",
    accent: "#FFD700",
    keywords: ["stripe", "billing", "money"],
  },
  {
    id: "users",
    label: "Users",
    href: "/admin/users",
    group: "Ops Intelligence",
    accent: "#00FFFF",
  },
  {
    id: "messages",
    label: "Messages",
    href: "/admin/messages",
    group: "Ops Intelligence",
    accent: "#00FFFF",
    keywords: ["inbox"],
  },
  {
    id: "settings",
    label: "Settings",
    href: "/admin/settings",
    group: "Account",
    accent: "rgba(255,255,255,0.7)",
  },
];

/** Overseer workspace role pills — formerly sticky under the quick switch. */
export const OVERSEER_WORKSPACE_DESTINATIONS: ConciergeDestination[] = [
  {
    id: "ws-marcel",
    label: "Marcel",
    href: "/admin/overseer?workspace=marcel",
    group: "Workspaces",
    accent: "#FFD700",
  },
  {
    id: "ws-bigace",
    label: "Big Ace",
    href: "/admin/overseer?workspace=bigace",
    group: "Workspaces",
    accent: "#00FFFF",
  },
  {
    id: "ws-jaypaul",
    label: "Jay Paul",
    href: "/admin/overseer?workspace=jaypaul",
    group: "Workspaces",
    accent: "#FF2DAA",
  },
  {
    id: "ws-justin",
    label: "Justin",
    href: "/admin/overseer?workspace=justin",
    group: "Workspaces",
    accent: "#AA2DFF",
  },
  {
    id: "ws-michaelcharlie",
    label: "Michael Charlie",
    href: "/admin/overseer?workspace=michaelcharlie",
    group: "Workspaces",
    accent: "#00FF88",
  },
  {
    id: "ws-legal",
    label: "Legal",
    href: "/admin/overseer?workspace=legal",
    group: "Workspaces",
    accent: "#FFD700",
  },
];

export const CONCIERGE_GROUP_ORDER: ConciergeGroup[] = [
  "Command Deck",
  "Dashboards",
  "Ops Intelligence",
  "Workspaces",
  "Account",
];

export function filterConciergeDestinations(
  destinations: ConciergeDestination[],
  query: string,
): ConciergeDestination[] {
  const q = query.trim().toLowerCase();
  if (!q) return destinations;
  return destinations.filter((d) => {
    const hay = [d.label, d.group, d.href ?? "", ...(d.keywords ?? [])].join(" ").toLowerCase();
    return hay.includes(q);
  });
}
