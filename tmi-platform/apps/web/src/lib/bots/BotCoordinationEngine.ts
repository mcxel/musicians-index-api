/**
 * BotCoordinationEngine
 * Manages multi-bot teamwork, allowing them to form squads, elect leaders, and execute joint missions (e.g., flooding a room to hype).
 */
import { randomUUID } from "crypto";

export interface BotSquad {
  squadId: string;
  leaderId: string;
  members: string[];
  mission: string;
  status: "forming" | "active" | "completed";
}

export class BotCoordinationEngine {
  private squads = new Map<string, BotSquad>();

  formSquad(leaderId: string, members: string[], mission: string): BotSquad {
    const squad: BotSquad = {
      squadId: randomUUID(),
      leaderId,
      members,
      mission,
      status: "active"
    };
    this.squads.set(squad.squadId, squad);
    return squad;
  }

  disbandSquad(squadId: string): void {
    const squad = this.squads.get(squadId);
    if (squad) squad.status = "completed";
  }

  getActiveSquads(): BotSquad[] {
    return Array.from(this.squads.values()).filter(s => s.status === "active");
  }
}

export const botCoordinationEngine = new BotCoordinationEngine();