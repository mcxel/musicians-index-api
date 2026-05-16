import type { TmiAdminRole } from "@/lib/admin/tmiAdminAccessGuard";
import { canAccessCapability } from "@/lib/admin/tmiAdminAccessGuard";

export type TmiOverseerTile = {
  id: string;
  label: string;
  route: string;
  capability: "overseer-deck" | "observation" | "route-jump" | "telemetry-only";
};

const TILES: TmiOverseerTile[] = [
  { id: "obs", label: "Observation Wall", route: "/admin/observation", capability: "observation" },
  { id: "routes", label: "Route Graph", route: "/admin/routes", capability: "route-jump" },
  { id: "bots", label: "Bot Telemetry", route: "/admin/bots", capability: "telemetry-only" },
  { id: "audience", label: "Audience Seat Inspector", route: "/admin/audience", capability: "observation" },
  { id: "mag", label: "Magazine Inspector", route: "/admin/magazine", capability: "observation" },
];

export function getOverseerTilesForRole(role: TmiAdminRole): TmiOverseerTile[] {
  return TILES.filter((tile) => canAccessCapability(role, tile.capability));
}
