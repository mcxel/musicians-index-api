import { ArtistLeadState } from "./ArtistLeadEngine";

/**
 * ArtistOnboardingRoutingEngine
 * Safely routes leads and users through the TMI magazine and platform ecosystem.
 */
export class ArtistOnboardingRoutingEngine {
  static routeToOnboarding(leadId: string): string {
    return `/signup/performer?lead=${leadId}`;
  }

  static routeToProfileSetup(artistId: string): string {
    return `/profile/${artistId}/setup`;
  }

  static routeToArticleSubmission(artistId: string): string {
    return `/magazine/submit-feature?artist=${artistId}`;
  }

  static routeToSponsorReadiness(artistId: string): string {
    return `/sponsor/readiness-flow?artist=${artistId}`;
  }

  static getNextActionRoute(artistId: string, currentState: ArtistLeadState): string {
    switch (currentState) {
      case "signup-started":   return this.routeToOnboarding(artistId);
      case "onboarded":        return this.routeToProfileSetup(artistId);
      case "profile-live":     return this.routeToArticleSubmission(artistId);
      case "article-live":     return this.routeToSponsorReadiness(artistId);
      default:                 return `/home/1`; // Redirect to main magazine cover fallback
    }
  }
}