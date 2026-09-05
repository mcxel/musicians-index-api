/**
 * HappyDaysStore — Submission manager and curated magazine community pool.
 * Shared between client store and server memory fallback.
 */

import type {
  HappyDaysSubmission,
  HappyDaysMagazineEntry,
  HappyDaysAttribution,
} from "./HappyDaysContracts";
import { logHappyDaysEvent, HAPPY_DAYS_EVENT } from "./HappyDaysObservatoryEvents";

export function formatAttributionLabel(
  preference: HappyDaysAttribution,
  displayName: string,
  userRole: "fan" | "performer",
  userId: string,
): string {
  switch (preference) {
    case "public_name":
      return displayName;
    case "tmi_id":
      return `${userRole === "performer" ? "TMI ARTIST" : "TMI FAN"} #${userId.replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase() || "001"}`;
    case "performer_alias":
      return `${displayName} · Performer`;
    case "fan_handle":
      return `${displayName} · Fan`;
    case "anonymous_community":
      return "TMI Community Member";
    default:
      return displayName;
  }
}

// Starts empty: only real, consented user submissions may enter the community pool.
const INITIAL_APPROVED_SUBMISSIONS: HappyDaysSubmission[] = [];

class HappyDaysRegistrySingleton {
  private submissions: HappyDaysSubmission[] = [...INITIAL_APPROVED_SUBMISSIONS];

  public submitResponse(data: {
    promptId: string;
    promptText: string;
    response: string;
    userRole: "fan" | "performer";
    userId: string;
    displayName: string;
    attributionPreference: HappyDaysAttribution;
    destination: "private" | "friends" | "magazine";
    attachedTrack?: { title: string; artist: string; id?: string; url?: string };
    attachedMedia?: { type: "yopho" | "image" | "snip"; url: string; id?: string };
  }): HappyDaysSubmission {
    const submission: HappyDaysSubmission = {
      id: `hd-sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      promptId: data.promptId,
      promptText: data.promptText,
      response: data.response.trim(),
      userRole: data.userRole,
      userId: data.userId,
      displayName: data.displayName,
      attributionPreference: data.attributionPreference,
      destination: data.destination,
      attachedTrack: data.attachedTrack,
      attachedMedia: data.attachedMedia,
      consentStatus: "granted",
      // Submissions for magazine auto-approved in development/community pool with basic sanity
      moderationState: data.destination === "magazine" ? "approved" : "pending",
      submittedAt: Date.now(),
      publishedAt: data.destination === "magazine" ? Date.now() : undefined,
    };

    this.submissions.unshift(submission);

    logHappyDaysEvent(HAPPY_DAYS_EVENT.RESPONSE_SUBMITTED, {
      promptId: data.promptId,
      destination: data.destination,
      role: data.userRole,
      hasTrackAttachment: Boolean(data.attachedTrack),
      hasMediaAttachment: Boolean(data.attachedMedia),
    });

    return submission;
  }

  public getApprovedMagazineEntries(): HappyDaysMagazineEntry[] {
    return this.submissions
      .filter((s) => s.destination === "magazine" && s.moderationState === "approved" && s.consentStatus === "granted")
      .map((s) => ({
        id: s.id,
        quote: s.response,
        author: s.displayName,
        role: s.userRole,
        attributionLabel: formatAttributionLabel(s.attributionPreference, s.displayName, s.userRole, s.userId),
        promptText: s.promptText,
        attachedTrack: s.attachedTrack,
        attachedImageUrl: s.attachedMedia?.url,
        publishedAt: s.publishedAt ?? s.submittedAt,
      }));
  }

  public getAllSubmissions(): HappyDaysSubmission[] {
    return [...this.submissions];
  }
}

export const HappyDaysRegistry = new HappyDaysRegistrySingleton();
