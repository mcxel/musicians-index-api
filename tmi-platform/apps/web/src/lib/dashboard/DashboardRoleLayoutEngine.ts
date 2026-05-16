export type UserRole = "fan" | "artist" | "performer" | "producer" | "writer" | "venue" | "sponsor" | "advertiser" | "admin";

export interface LayoutPanel {
  panelId: string;
  label: string;
  component: string;
  order: number;
  width: "full" | "half" | "third";
  defaultCollapsed: boolean;
  requiredRole?: UserRole[];
}

export interface RoleLayout {
  role: UserRole;
  title: string;
  accentColor: string;
  panels: LayoutPanel[];
}

const ROLE_LAYOUTS: Record<UserRole, RoleLayout> = {
  fan: {
    role: "fan",
    title: "Fan Dashboard",
    accentColor: "#00FFFF",
    panels: [
      { panelId: "fan-feed",       label: "Live Feed",         component: "DashboardFeedPanel",      order: 0, width: "full",  defaultCollapsed: false },
      { panelId: "fan-battles",    label: "Active Battles",    component: "DashboardBattlePanel",    order: 1, width: "half",  defaultCollapsed: false },
      { panelId: "fan-wallet",     label: "Points & Wallet",   component: "DashboardMetricCard",     order: 2, width: "half",  defaultCollapsed: false },
      { panelId: "fan-artists",    label: "Following",         component: "DashboardActionRail",     order: 3, width: "full",  defaultCollapsed: false },
      { panelId: "fan-nfts",       label: "My NFTs",           component: "DashboardPanel",          order: 4, width: "half",  defaultCollapsed: true  },
    ],
  },
  artist: {
    role: "artist",
    title: "Artist Dashboard",
    accentColor: "#AA2DFF",
    panels: [
      { panelId: "artist-metrics", label: "Performance Stats", component: "DashboardMetricCard",     order: 0, width: "full",  defaultCollapsed: false },
      { panelId: "artist-battles", label: "Battle Queue",      component: "DashboardBattlePanel",    order: 1, width: "half",  defaultCollapsed: false },
      { panelId: "artist-revenue", label: "Revenue",           component: "DashboardChartPanel",     order: 2, width: "half",  defaultCollapsed: false },
      { panelId: "artist-monitor", label: "Video Monitor",     component: "DashboardVideoMonitor",   order: 3, width: "full",  defaultCollapsed: false },
      { panelId: "artist-fans",    label: "Fan Activity",      component: "DashboardPanel",          order: 4, width: "half",  defaultCollapsed: false },
      { panelId: "artist-actions", label: "Quick Actions",     component: "DashboardActionRail",     order: 5, width: "half",  defaultCollapsed: false },
    ],
  },
  performer: {
    role: "performer",
    title: "Performer Dashboard",
    accentColor: "#FF2DAA",
    panels: [
      { panelId: "perf-monitor",   label: "Live Monitor",      component: "DashboardVideoMonitor",   order: 0, width: "full",  defaultCollapsed: false },
      { panelId: "perf-battles",   label: "Battle History",    component: "DashboardBattlePanel",    order: 1, width: "half",  defaultCollapsed: false },
      { panelId: "perf-revenue",   label: "Earnings",          component: "DashboardChartPanel",     order: 2, width: "half",  defaultCollapsed: false },
      { panelId: "perf-actions",   label: "Quick Actions",     component: "DashboardActionRail",     order: 3, width: "full",  defaultCollapsed: false },
    ],
  },
  producer: {
    role: "producer",
    title: "Producer Dashboard",
    accentColor: "#FFD700",
    panels: [
      { panelId: "prod-beats",     label: "Beat Sales",        component: "DashboardChartPanel",     order: 0, width: "full",  defaultCollapsed: false },
      { panelId: "prod-revenue",   label: "Revenue Breakdown", component: "DashboardMetricCard",     order: 1, width: "half",  defaultCollapsed: false },
      { panelId: "prod-licensing", label: "Active Licenses",   component: "DashboardPanel",          order: 2, width: "half",  defaultCollapsed: false },
      { panelId: "prod-actions",   label: "Upload & Publish",  component: "DashboardActionRail",     order: 3, width: "full",  defaultCollapsed: false },
    ],
  },
  writer: {
    role: "writer",
    title: "Writer Dashboard",
    accentColor: "#00FF88",
    panels: [
      { panelId: "write-articles", label: "My Articles",       component: "DashboardPanel",          order: 0, width: "full",  defaultCollapsed: false },
      { panelId: "write-revenue",  label: "Writing Revenue",   component: "DashboardMetricCard",     order: 1, width: "half",  defaultCollapsed: false },
      { panelId: "write-actions",  label: "Submit Article",    component: "DashboardActionRail",     order: 2, width: "half",  defaultCollapsed: false },
    ],
  },
  venue: {
    role: "venue",
    title: "Venue Dashboard",
    accentColor: "#FF9500",
    panels: [
      { panelId: "venue-seats",    label: "Seat Occupancy",    component: "DashboardChartPanel",     order: 0, width: "full",  defaultCollapsed: false },
      { panelId: "venue-revenue",  label: "Ticket Revenue",    component: "DashboardMetricCard",     order: 1, width: "half",  defaultCollapsed: false },
      { panelId: "venue-events",   label: "Upcoming Events",   component: "DashboardPanel",          order: 2, width: "half",  defaultCollapsed: false },
      { panelId: "venue-monitor",  label: "Room Monitor",      component: "DashboardVideoMonitor",   order: 3, width: "full",  defaultCollapsed: false },
      { panelId: "venue-actions",  label: "Manage Venue",      component: "DashboardActionRail",     order: 4, width: "full",  defaultCollapsed: false },
    ],
  },
  sponsor: {
    role: "sponsor",
    title: "Sponsor Dashboard",
    accentColor: "#FF9500",
    panels: [
      { panelId: "spon-campaigns", label: "Campaigns",         component: "DashboardPanel",          order: 0, width: "full",  defaultCollapsed: false },
      { panelId: "spon-metrics",   label: "Reach & Impressions",component: "DashboardMetricCard",   order: 1, width: "half",  defaultCollapsed: false },
      { panelId: "spon-revenue",   label: "ROI Chart",         component: "DashboardChartPanel",     order: 2, width: "half",  defaultCollapsed: false },
      { panelId: "spon-actions",   label: "Create Campaign",   component: "DashboardActionRail",     order: 3, width: "full",  defaultCollapsed: false },
    ],
  },
  advertiser: {
    role: "advertiser",
    title: "Advertiser Dashboard",
    accentColor: "#0088FF",
    panels: [
      { panelId: "adv-placements", label: "Ad Placements",     component: "DashboardPanel",          order: 0, width: "full",  defaultCollapsed: false },
      { panelId: "adv-metrics",    label: "Impression Stats",  component: "DashboardMetricCard",     order: 1, width: "half",  defaultCollapsed: false },
      { panelId: "adv-chart",      label: "Spend Chart",       component: "DashboardChartPanel",     order: 2, width: "half",  defaultCollapsed: false },
      { panelId: "adv-actions",    label: "Buy Placement",     component: "DashboardActionRail",     order: 3, width: "full",  defaultCollapsed: false },
    ],
  },
  admin: {
    role: "admin",
    title: "Admin Dashboard",
    accentColor: "#FF2DAA",
    panels: [
      { panelId: "admin-users",    label: "User Stats",        component: "DashboardMetricCard",     order: 0, width: "full",  defaultCollapsed: false },
      { panelId: "admin-revenue",  label: "Platform Revenue",  component: "DashboardChartPanel",     order: 1, width: "half",  defaultCollapsed: false },
      { panelId: "admin-bots",     label: "Bot Status",        component: "DashboardPanel",          order: 2, width: "half",  defaultCollapsed: false },
      { panelId: "admin-monitor",  label: "System Monitor",    component: "DashboardVideoMonitor",   order: 3, width: "full",  defaultCollapsed: false },
      { panelId: "admin-actions",  label: "Admin Actions",     component: "DashboardActionRail",     order: 4, width: "full",  defaultCollapsed: false },
    ],
  },
};

export function getRoleLayout(role: UserRole): RoleLayout {
  return ROLE_LAYOUTS[role] ?? ROLE_LAYOUTS.fan;
}

export function getDefaultPanelOrder(role: UserRole): string[] {
  return getRoleLayout(role).panels.map((p) => p.panelId);
}

export function getPanelById(role: UserRole, panelId: string): LayoutPanel | null {
  return getRoleLayout(role).panels.find((p) => p.panelId === panelId) ?? null;
}

export function getAccentColor(role: UserRole): string {
  return ROLE_LAYOUTS[role]?.accentColor ?? "#00FFFF";
}

export function allRoles(): UserRole[] {
  return Object.keys(ROLE_LAYOUTS) as UserRole[];
}
