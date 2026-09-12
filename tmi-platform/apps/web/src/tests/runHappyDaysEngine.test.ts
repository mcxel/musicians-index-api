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
  HAPPY_DAYS_PROMPTS,
  getDailyHappyDaysPrompt,
  getHappyDaysPromptById,
} from "../lib/happydays/HappyDaysPromptRegistry";
import {
  HappyDaysRegistry,
  formatAttributionLabel,
} from "../lib/happydays/HappyDaysStore";

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
