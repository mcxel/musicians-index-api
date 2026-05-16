export type BigAceSite = "bernoutglobal" | "tmi" | "bernoutglobal-xxl";

export interface BigAceSiteRoute {
  site: BigAceSite;
  name: string;
  route: string;
  routeHealth: "healthy" | "degraded" | "down";
}

const SITE_ROUTES: BigAceSiteRoute[] = [
  { site: "bernoutglobal", name: "BG Home", route: "/", routeHealth: "healthy" },
  { site: "tmi", name: "TMI Home", route: "/home/1", routeHealth: "healthy" },
  { site: "bernoutglobal-xxl", name: "XXL Program", route: "/program", routeHealth: "degraded" },
  { site: "tmi", name: "Promotions", route: "/admin/big-ace/promotions", routeHealth: "healthy" },
  { site: "tmi", name: "Billboards", route: "/admin/big-ace/billboards", routeHealth: "healthy" },
];

export function listBigAceSiteRoutes(): BigAceSiteRoute[] {
  return SITE_ROUTES;
}
