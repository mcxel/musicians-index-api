import { ArtistLeadTargetType } from "./ArtistOutreachEngine";

export type ArtistLeadState =
  | "discovered"
  | "contacted"
  | "interested"
  | "signup-started"
  | "onboarded"
  | "profile-live"
  | "article-live"
  | "sponsor-ready"
  | "contest-qualified";

export type ArtistLeadPlatform = "instagram" | "tiktok" | "youtube" | "soundcloud" | "spotify" | "local-venue";

export interface ArtistLead {
  id: string;
  name: string;
  targetType: ArtistLeadTargetType;
  state: ArtistLeadState;
  sourcePlatform: ArtistLeadPlatform;
  contactData: string;
  discoveryDate: Date;
  lastContactDate?: Date;
}

export class ArtistLeadEngine {
  static discoverArtistLeads(batchSize: number = 50): ArtistLead[] {
    // Scans integrated platforms & local venue feeds to find un-onboarded creators
    return [];
  }

  static updateLeadState(leadId: string, newState: ArtistLeadState): void {
    // Updates tracking DB, signals Michael Charlie if anomalies arise in conversion rates
  }

  static getLeadsByState(state: ArtistLeadState): ArtistLead[] {
    // Fetches cohort of leads for batch routing / tasks
    return [];
  }
}