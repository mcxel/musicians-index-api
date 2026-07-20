/**
 * Route & Button Audit Registry — Rule 20 certification data.
 *
 * This is a manually-run audit ledger, not a live crawler. Nothing on this
 * platform automatically clicks every button and inspects every route on a
 * schedule — that would be a separate, much larger automated-testing project
 * (a real one, not a stub of one — see Rule 20's ban on faking "the platform
 * checks itself" without an engine that actually does). What this file does
 * hold is real: the findings from the most recent manual Fan/Performer
 * surface audit, and the fixes actually applied afterward. Update
 * `AUDIT_LAST_RUN` and the entries below whenever a new audit pass runs.
 *
 * Entry `kind`:
 *   "button" — a specific verified button/link, file+line traceable.
 *   "summary" — an aggregate count for a surface's already-verified-working
 *               items, not itemized per-button (see the audit report for
 *               the full per-button breakdown this was rolled up from).
 */

export type AuditStatus = "working" | "fixed" | "broken" | "flagged";
export type AuditKind = "button" | "summary";

export interface AuditEntry {
  id: string;
  surface: string;
  kind: AuditKind;
  file: string;
  line?: number;
  label: string;
  target: string;
  status: AuditStatus;
  note?: string;
}

export const AUDIT_LAST_RUN = "2026-07-19";

export const ROUTE_BUTTON_AUDIT: AuditEntry[] = [
  // ── Fan Hub (FanHQShell.tsx) ──────────────────────────────────────────
  {
    id: "fan-customize-avatar",
    surface: "Fan Hub",
    kind: "button",
    file: "components/fan/FanHQShell.tsx",
    line: 872,
    label: "CUSTOMIZE AVATAR",
    target: "/avatar-center",
    status: "fixed",
    note: "Had no onClick at all. Wired to /avatar-center (Rule 26 fan-only avatar surface).",
  },
  {
    id: "fan-view-all-memories",
    surface: "Fan Hub",
    kind: "button",
    file: "components/fan/FanHQShell.tsx",
    line: 942,
    label: "VIEW ALL MEMORIES",
    target: "/memories",
    status: "fixed",
    note: "Had no onClick at all. Wired to /memories.",
  },
  {
    id: "fan-bottom-dock-duplicate",
    surface: "Fan Hub",
    kind: "button",
    file: "components/fan/FanHQShell.tsx",
    line: 1108,
    label: "LEAVE ROOM / MIC ON / CAM ON / ENTER STAGE (legacy inline dock)",
    target: "(removed — duplicated MasterControlDock)",
    status: "fixed",
    note: "Shell rendered its own dead-handler copy of this bar stacked with a working <MasterControlDock>. Removed the duplicate; MasterControlDock is now the single bottom dock, wired to real onLeaveRoom/onEnterStage.",
  },
  {
    id: "fan-mcd-leave-enter",
    surface: "Fan Hub",
    kind: "button",
    file: "components/shell/MasterControlDock.tsx",
    line: 160,
    label: "LEAVE ROOM / ENTER STAGE (MasterControlDock)",
    target: "stopWatching() / router.push(mainRoute)",
    status: "fixed",
    note: "onLeaveRoom/onEnterStage props existed but were never passed by FanHQShell. Now wired to the real WatchSessionContext.stopWatching() and the live featured-room route.",
  },
  {
    id: "fan-live-now-selfloop",
    surface: "Fan Hub",
    kind: "button",
    file: "components/fan/FanHQShell.tsx",
    line: 478,
    label: "LIVE NOW (top nav + bottom dock)",
    target: "/live",
    status: "fixed",
    note: "Pointed back to /hub/fan (the page you're already on). Now routes to /live.",
  },
  {
    id: "fan-chat-reactions",
    surface: "Fan Hub",
    kind: "button",
    file: "components/fan/FanHQShell.tsx",
    line: 1061,
    label: "Chat emoji / send buttons",
    target: "(none)",
    status: "flagged",
    note: "Part of a larger fake-data panel: the chat message list is a hardcoded static array, not a real per-room chat. Wiring the send button without a real chat backend would create a second, deceptive fake — needs a real chat engine, not a button fix. Left as-is, flagged for a dedicated pass.",
  },
  {
    id: "fan-hub-summary",
    surface: "Fan Hub",
    kind: "summary",
    file: "components/fan/FanHQShell.tsx",
    label: "All other Fan Hub nav/sidebar/quick-link buttons",
    target: "various",
    status: "working",
    note: "Profile avatar, mobile quick links, desktop top nav, sidebar (Live Rooms/Lobby/Messages/Friends/Inventory/Memory Wall/Playlists/Camera/Rewards/Store/Settings) all verified routing to real, existing pages.",
  },

  // ── Performer Hub ─────────────────────────────────────────────────────
  {
    id: "performer-hub-summary",
    surface: "Performer Hub",
    kind: "summary",
    file: "app/hub/performer/page.tsx",
    label: "All Performer Hub nav/action/dashboard buttons",
    target: "various",
    status: "working",
    note: "Nav links, Go Live/Challenge/Mint NFT/Messages/Invite Fans strip, PerformerHubDashboard action handlers (go live, end show, mic, AI co-host, phases, bookings), Beat Producer grid — all verified real and wired.",
  },
  {
    id: "performer-simulate-tip",
    surface: "Performer Hub",
    kind: "button",
    file: "components/hub/PerformerHubDashboard.tsx",
    line: 144,
    label: "Simulate Tip (dev/demo control)",
    target: "recordRevenue() with randomized amount",
    status: "broken",
    note: "Rule 20 violation, not a routing bug: injects fabricated randomized revenue directly into the same ledger the dashboard's real Revenue stat reads from. Needs to be removed or moved behind a dev-only flag that never touches the production revenue ledger — not fixed yet.",
  },

  // ── Fan / Performer Profile ───────────────────────────────────────────
  {
    id: "profile-summary",
    surface: "Fan + Performer Profile",
    kind: "summary",
    file: "app/profile/fan/[slug]/page.tsx, app/profile/performer/[slug]/page.tsx",
    label: "Message / Video Chat / Join Room / Article / Back to Hub links",
    target: "various",
    status: "working",
    note: "All real, DB-backed pages. No dead links found.",
  },

  // ── Account / Settings ────────────────────────────────────────────────
  {
    id: "account-settings-summary",
    surface: "Account / Settings",
    kind: "summary",
    file: "app/account/page.tsx, app/settings/**",
    label: "All account & settings links and save actions",
    target: "various",
    status: "working",
    note: "26 account links, all settings tabs' save actions verified against real API routes. Linked Accounts tab honestly labeled 'coming soon' (acceptable per Rule 20).",
  },

  // ── Global Nav ─────────────────────────────────────────────────────────
  {
    id: "navrail-my-hub-hardcode",
    surface: "Global Nav — NavigationRail",
    kind: "button",
    file: "components/nav/NavigationRail.tsx",
    line: 189,
    label: "MY HUB (footer)",
    target: "ROLE_HUB[role]",
    status: "fixed",
    note: "Hardcoded to /hub/performer for every signed-in user regardless of role — a fan clicking this landed on a performer-only hub. Now routes by real role via a ROLE_HUB map.",
  },
  {
    id: "global-nav-summary",
    surface: "Global Nav — TMIGlobalNav / MagazineNavBar / NavigationRail",
    kind: "summary",
    file: "components/system/TMIGlobalNav.tsx, components/magazine/MagazineNavBar.tsx, components/nav/NavigationRail.tsx",
    label: "All other global nav links",
    target: "various",
    status: "working",
    note: "TMIGlobalNav rebuilt into a full-width dock (Home routes per-role dashboard, Discover/Live Now/Lobby/Explore/Search/Notifications-real-count/Messages) — all targets verified to exist.",
  },

  // ── Landing surfaces ──────────────────────────────────────────────────
  {
    id: "landing-summary",
    surface: "Landing Surfaces",
    kind: "summary",
    file: "app/live/page.tsx, app/discover/page.tsx, app/explore/page.tsx, app/live/lobby/page.tsx",
    label: "Room cards, browse redirects, artist/room links",
    target: "various",
    status: "working",
    note: "All targets resolve to real pages. /live/lobby is the one surface confirmed fully real-data-driven with no fake numbers. /live, /discover and /explore have real routing but known Rule 20 fake-data content (viewer counts, seed chat, fake follower counts) unrelated to routing — separate cleanup, not a broken-button issue.",
  },
];

export function getAuditCounts() {
  const counts = { working: 0, fixed: 0, broken: 0, flagged: 0 };
  for (const entry of ROUTE_BUTTON_AUDIT) counts[entry.status]++;
  return counts;
}
