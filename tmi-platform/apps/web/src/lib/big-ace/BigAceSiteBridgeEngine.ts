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

  /** Business comms directives run through the authority-envelope command bus (not raw mailbox access). */
  static async runBusinessCommsDirective(
    operatorId: string,
    directive: import("@/lib/big-ace/BigAceBusinessCommunicationsBridge").BigAceBusinessDirective,
  ) {
    const { executeBigAceBusinessDirective } = await import(
      "@/lib/big-ace/BigAceBusinessCommunicationsBridge"
    );
    return executeBigAceBusinessDirective(operatorId, directive);
  }

  static returnToCommandHub(): string {
    return "/admin/big-ace";
  }
}

export default BigAceSiteBridgeEngine;
