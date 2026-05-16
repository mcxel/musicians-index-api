import { ArtistLeadEngine, ArtistLeadState } from "./ArtistLeadEngine";
import { buildArtistOutreachMessagePack, generateFollowUpTasks } from "./ArtistOutreachEngine";
import { ArtistOnboardingRoutingEngine } from "./ArtistOnboardingRoutingEngine";

/**
 * MagazineArtistAcquisitionBotEngine
 * Automates the discovery, outreach, and lifecycle progression of performers into the TMI ecosystem.
 */
export class MagazineArtistAcquisitionBotEngine {
  
  static executeDiscoveryCycle() {
    // 1. Discover new artists across platforms
    const newLeads = ArtistLeadEngine.discoverArtistLeads(100);
    
    // 2. Generate outreach scripts & tasks
    for (const lead of newLeads) {
      const pitch = buildArtistOutreachMessagePack(lead.targetType);
      
      // Execute initial outreach through approved channels
      ArtistLeadEngine.updateLeadState(lead.id, "contacted");
      
      // Queue standard follow-up timeline
      const followUps = generateFollowUpTasks(lead.id, lead.targetType);
    }
    
    return { discovered: newLeads.length, status: "Discovery Cycle Complete" };
  }

  static processLeadRouting(leadId: string, currentState: ArtistLeadState) {
    const nextRoute = ArtistOnboardingRoutingEngine.getNextActionRoute(leadId, currentState);
    return { leadId, currentState, nextActionRoute: nextRoute };
  }
  
  static upgradeLeadState(leadId: string, currentState: ArtistLeadState, actionCompleted: string) {
    let nextState: ArtistLeadState = currentState;
    
    if (currentState === "interested" && actionCompleted === "signup") nextState = "signup-started";
    if (currentState === "signup-started" && actionCompleted === "onboard") nextState = "onboarded";
    if (currentState === "onboarded" && actionCompleted === "profile_published") nextState = "profile-live";
    if (currentState === "profile-live" && actionCompleted === "article_approved") nextState = "article-live";
    if (currentState === "article-live" && actionCompleted === "sponsors_secured") nextState = "sponsor-ready";
    if (currentState === "sponsor-ready" && actionCompleted === "contest_opt_in") nextState = "contest-qualified";

    if (nextState !== currentState) {
      ArtistLeadEngine.updateLeadState(leadId, nextState);
    }
    return nextState;
  }
}