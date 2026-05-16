import {
  listBigAceSiteRoutes,
  type BigAceSite,
  type BigAceSiteRoute,
} from "@/lib/big-ace/BigAceSiteTravelRegistry";
import { BigAceCrossSiteMemoryEngine } from "@/lib/big-ace/BigAceCrossSiteMemoryEngine";

export interface BigAceHealthSnapshot {
  site: BigAceSite;
  routeHealth: BigAceSiteRoute["routeHealth"];
  botHealth: "healthy" | "degraded";
  promotionHealth: "healthy" | "degraded";
  billboardHealth: "healthy" | "degraded";
}

export class BigAceSiteBridgeEngine {
  static travel(site: BigAceSite): BigAceSiteRoute[] {
    return listBigAceSiteRoutes().filter((route) => route.site === site);
  }

  static getHealth(): BigAceHealthSnapshot[] {
    return [
      { site: "bernoutglobal", routeHealth: "healthy", botHealth: "healthy", promotionHealth: "healthy", billboardHealth: "healthy" },
      { site: "tmi", routeHealth: "healthy", botHealth: "healthy", promotionHealth: "healthy", billboardHealth: "healthy" },
      { site: "bernoutglobal-xxl", routeHealth: "degraded", botHealth: "degraded", promotionHealth: "healthy", billboardHealth: "degraded" },
    ];
  }

  static assignTask(site: BigAceSite, task: string): string {
    BigAceCrossSiteMemoryEngine.write(site, `TASK: ${task}`);
    return `Assigned to ${site}: ${task}`;
  }

  static returnToCommandHub(): string {
    return "/admin/big-ace";
  }
}

export default BigAceSiteBridgeEngine;
