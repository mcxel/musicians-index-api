import { listBigAceSiteRoutes, type BigAceSite } from "@/lib/big-ace/BigAceSiteTravelRegistry";

export interface BigAceMemoryNote {
  id: string;
  site: BigAceSite;
  note: string;
  createdAt: string;
}

const MEMORY = new Map<string, BigAceMemoryNote>();

export class BigAceCrossSiteMemoryEngine {
  static readAll(): BigAceMemoryNote[] {
    return Array.from(MEMORY.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  static write(site: BigAceSite, note: string): BigAceMemoryNote {
    const entry: BigAceMemoryNote = {
      id: `note-${Date.now()}`,
      site,
      note,
      createdAt: new Date().toISOString(),
    };
    MEMORY.set(entry.id, entry);
    return entry;
  }

  static seedHealthNotes(): void {
    if (MEMORY.size > 0) return;
    for (const route of listBigAceSiteRoutes()) {
      this.write(route.site, `${route.name} route health: ${route.routeHealth}`);
    }
  }
}

export default BigAceCrossSiteMemoryEngine;
