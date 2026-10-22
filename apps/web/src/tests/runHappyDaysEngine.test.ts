/**
 * HappyDaysEngine Test Suite
 *
 * Verifies:
 * 1. Deterministic rotating prompt resolution.
 * 2. Non-clinical, supportive prompt models.
 * 3. Submission flow with destination routing (private, friends, magazine).
 * 4. Attribution formatting (public name, TMI ID, performer alias, fan handle, anonymous).
 * 5. Approved magazine pool extraction.
 */

import {
  COMMUNITY_GOSSIP_PROMPTS,
  HAPPY_DAYS_PROMPTS,
  PUBLICATION_TIME_AUTHORITY,
  getDailyHappyDaysPrompt,
  getHappyDaysPromptById,
  publicationDateKeyFromInstant,
  resolvePublicationPrompt,
} from "../lib/happydays/HappyDaysPromptRegistry";
import {
  HappyDaysRegistry,
  formatAttributionLabel,
} from "../lib/happydays/HappyDaysStore";
import {
  SOCIAL_MOMENT_DWELL_MS,
  advanceSocialMoment,
  applyPublicationDate,
  blurSocialMoment,
  clearSocialMomentDraft,
  createSocialMomentPresentation,
  focusSocialMoment,
  writeSocialMomentDraft,
} from "../lib/happydays/socialMomentPresentation";

describe("Happy Days Prompt Registry", () => {
  it("provides canonical positive non-clinical prompts", () => {
    expect(HAPPY_DAYS_PROMPTS.length).toBeGreaterThanOrEqual(8);
    for (const prompt of HAPPY_DAYS_PROMPTS) {
      expect(prompt.id).toBeDefined();
      expect(prompt.promptText.length).toBeGreaterThan(5);
      expect(prompt.category).toBeDefined();
    }
  });

  it("rotates prompts deterministically by date", () => {
    const d1 = new Date("2026-08-01T12:00:00Z");
    const d2 = new Date("2026-08-02T12:00:00Z");
    const p1 = getDailyHappyDaysPrompt(d1);
    const p2 = getDailyHappyDaysPrompt(d2);

    expect(p1.id).toBeDefined();
    expect(p2.id).toBeDefined();
    expect(p1.id).not.toBe(p2.id);

    // Same date yields same prompt
    const p1Again = getDailyHappyDaysPrompt(d1);
    expect(p1Again.id).toBe(p1.id);
  });

  it("retrieves prompts by ID", () => {
    const prompt = getHappyDaysPromptById("prompt-happy-01");
    expect(prompt).toBeDefined();
    expect(prompt?.promptText).toContain("happy");
  });
});

describe("Happy Days Store & Community Pool", () => {
  it("formats attribution labels accurately across all options", () => {
    expect(formatAttributionLabel("public_name", "Devon K.", "fan", "fan-123")).toBe("Devon K.");
    expect(formatAttributionLabel("performer_alias", "Marcel B.", "performer", "perf-456")).toBe("Marcel B. · Performer");
    expect(formatAttributionLabel("fan_handle", "Elena R.", "fan", "fan-789")).toBe("Elena R. · Fan");
    expect(formatAttributionLabel("anonymous_community", "Secret Fan", "fan", "fan-999")).toBe("TMI Community Member");
    expect(formatAttributionLabel("tmi_id", "User", "performer", "perf-ABCD")).toContain("TMI ARTIST");
    expect(formatAttributionLabel("tmi_id", "User", "fan", "fan-WXYZ")).toContain("TMI FAN");
  });

  it("records user submissions and accepts opt-in magazine entries", () => {
    const submission = HappyDaysRegistry.submitResponse({
      promptId: "prompt-happy-01",
      promptText: "What makes you happy today?",
      response: "Unit testing the new Happy Days features with 100% test coverage!",
      userRole: "performer",
      userId: "test-user-perf-01",
      displayName: "Tester Performer",
      attributionPreference: "performer_alias",
      destination: "magazine",
      attachedTrack: {
        title: "Code Rhythm",
        artist: "Tester Performer",
      },
    });

    expect(submission.id).toBeDefined();
    expect(submission.consentStatus).toBe("granted");
    expect(submission.moderationState).toBe("approved");

    const entries = HappyDaysRegistry.getApprovedMagazineEntries();
    expect(entries.some((e) => e.id === submission.id)).toBe(true);

    const found = entries.find((e) => e.id === submission.id);
    expect(found?.quote).toContain("Unit testing");
    expect(found?.attachedTrack?.title).toBe("Code Rhythm");
  });
});

describe("Social moment publication day", () => {
  it("uses one UTC publication day for every viewer", () => {
    expect(PUBLICATION_TIME_AUTHORITY).toBe("PROVISIONAL_UTC_PRESENTATION_POLICY");
    expect(publicationDateKeyFromInstant(new Date("2026-08-02T02:00:00Z"))).toBe("2026-08-02");
    const happy = resolvePublicationPrompt("HAPPY_DAYS", "2026-08-02");
    const gossip = resolvePublicationPrompt("COMMUNITY_GOSSIP", "2026-08-02");
    expect(resolvePublicationPrompt("HAPPY_DAYS", "2026-08-02").id).toBe(happy.id);
    expect(resolvePublicationPrompt("COMMUNITY_GOSSIP", "2026-08-02").id).toBe(gossip.id);
    expect(happy.channel).toBe("HAPPY_DAYS");
    expect(gossip.channel).toBe("COMMUNITY_GOSSIP");
  });

  it("moves both channels on the next publication day", () => {
    expect(HAPPY_DAYS_PROMPTS.length).toBeGreaterThanOrEqual(11);
    expect(COMMUNITY_GOSSIP_PROMPTS.length).toBeGreaterThanOrEqual(12);
    expect(resolvePublicationPrompt("HAPPY_DAYS", "2026-08-03").id).not.toBe(
      resolvePublicationPrompt("HAPPY_DAYS", "2026-08-02").id,
    );
    expect(resolvePublicationPrompt("COMMUNITY_GOSSIP", "2026-08-03").id).not.toBe(
      resolvePublicationPrompt("COMMUNITY_GOSSIP", "2026-08-02").id,
    );
  });

  it("keeps the same prompt when the presentation is created again", () => {
    const first = createSocialMomentPresentation(Date.parse("2026-08-02T18:00:00Z"));
    const second = createSocialMomentPresentation(Date.parse("2026-08-02T18:00:00Z"));
    expect(second.promptId).toBe(first.promptId);
    expect(second.publicationDateKey).toBe("2026-08-02");
  });
});

describe("Social moment rotation and drafts", () => {
  const start = Date.parse("2026-08-02T18:00:00Z");

  it("flips Happy Days to Gossip and back on the 18 second clock", () => {
    const opened = createSocialMomentPresentation(start);
    expect(opened.channel).toBe("HAPPY_DAYS");
    const gossip = advanceSocialMoment(opened, start + SOCIAL_MOMENT_DWELL_MS);
    expect(gossip.channel).toBe("COMMUNITY_GOSSIP");
    const happy = advanceSocialMoment(gossip, start + SOCIAL_MOMENT_DWELL_MS * 2);
    expect(happy.channel).toBe("HAPPY_DAYS");
    expect(happy.promptId).toBe(opened.promptId);
  });

  it("does not switch while the draft is focused", () => {
    const opened = focusSocialMoment(createSocialMomentPresentation(start));
    const later = advanceSocialMoment(opened, start + SOCIAL_MOMENT_DWELL_MS + 5_000);
    expect(later.channel).toBe("HAPPY_DAYS");
    expect(later.promptId).toBe(opened.promptId);
  });

  it("keeps a non-empty draft pinned after blur", () => {
    const typed = writeSocialMomentDraft(createSocialMomentPresentation(start), "Celebrating the session.");
    const blurred = blurSocialMoment(typed, start + 1_000);
    const later = advanceSocialMoment(blurred, start + SOCIAL_MOMENT_DWELL_MS + 5_000);
    expect(later.channel).toBe("HAPPY_DAYS");
    expect(later.promptId).toBe(typed.promptId);
    expect(later.drafts.HAPPY_DAYS?.text).toBe("Celebrating the session.");
    expect(later.drafts.COMMUNITY_GOSSIP).toBeNull();
  });

  it("resumes rotation after the draft is cleared", () => {
    const typed = writeSocialMomentDraft(createSocialMomentPresentation(start), "Celebrating the session.");
    const cleared = clearSocialMomentDraft(typed, start + 2_000);
    const held = advanceSocialMoment(cleared, start + 3_000);
    expect(held.channel).toBe("HAPPY_DAYS");
    const flipped = advanceSocialMoment(cleared, start + 2_000 + SOCIAL_MOMENT_DWELL_MS);
    expect(flipped.channel).toBe("COMMUNITY_GOSSIP");
    expect(flipped.drafts.HAPPY_DAYS).toBeNull();
  });

  it("keeps the original prompt when the publication day changes under a draft", () => {
    const typed = writeSocialMomentDraft(createSocialMomentPresentation(start), "Still answering yesterday.");
    const nextDay = applyPublicationDate(typed, "2026-08-03");
    expect(nextDay.promptId).toBe(typed.promptId);
    expect(nextDay.publicationDateKey).toBe(typed.publicationDateKey);
    expect(nextDay.drafts.HAPPY_DAYS?.text).toBe("Still answering yesterday.");
  });

  it("still changes channel when reduced motion removes the slide", () => {
    const opened = createSocialMomentPresentation(start, true);
    expect(opened.motion).toBe("instant");
    const flipped = advanceSocialMoment(opened, start + SOCIAL_MOMENT_DWELL_MS);
    expect(flipped.channel).toBe("COMMUNITY_GOSSIP");
    expect(flipped.motion).toBe("instant");
  });
});
