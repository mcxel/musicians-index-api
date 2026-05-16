import { ADMIN_ROUTE_LIST, type AdminSectionId } from "@/lib/adminRouteMap";

export type AdminMonitorCard = {
  id: AdminSectionId;
  title: string;
  subtitle: string;
  route: string;
  panel: "left" | "center" | "right" | "bottom";
};

export const ADMIN_MONITOR_REGISTRY: AdminMonitorCard[] = [
  {
    id: "chain-command",
    title: "Chain Command",
    subtitle: "Big Ace chain and verification",
    route: "/admin/chain-command",
    panel: "left",
  },
  {
    id: "security",
    title: "Security Sentinel Wall",
    subtitle: "Threats and vulnerabilities",
    route: "/admin/security",
    panel: "left",
  },
  {
    id: "live-feed",
    title: "Live Feed Explorer",
    subtitle: "Rooms, events, artists, sponsors",
    route: "/admin/live-feed",
    panel: "center",
  },
  {
    id: "inbox",
    title: "Unified Inbox",
    subtitle: "Jay Paul, Micah, Big Ace",
    route: "/admin/inbox",
    panel: "center",
  },
  {
    id: "integrations",
    title: "Account Linker",
    subtitle: "Payments, ads, hosting",
    route: "/admin/integrations",
    panel: "right",
  },
  {
    id: "billing",
    title: "Money & Billing",
    subtitle: "Revenue, payouts, wallet state",
    route: "/admin/billing",
    panel: "right",
  },
  {
    id: "artist-analytics",
    title: "Artist Analytics & Revenue",
    subtitle: "Billboard rank and earnings",
    route: "/admin/artist-analytics",
    panel: "bottom",
  },
  {
    id: "magazine-analytics",
    title: "Musician Index & Magazine Analytics",
    subtitle: "Profile and content performance",
    route: "/admin/magazine-analytics",
    panel: "bottom",
  },
  {
    id: "bots",
    title: "Bot Roster & Summon",
    subtitle: "Sentinel + helper bot control",
    route: "/admin/bots",
    panel: "bottom",
  },
];

export function getMonitorCard(sectionId: AdminSectionId) {
  return ADMIN_MONITOR_REGISTRY.find((item) => item.id === sectionId) ?? ADMIN_MONITOR_REGISTRY[0];
}

export function getRegistryRoute(route: string) {
  return ADMIN_ROUTE_LIST.find((item) => item.route === route) ?? null;
}
