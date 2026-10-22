/**
 * ProfileConfigService unit tests
 *
 * Uses a Prisma client mock so no real DB is required.
 * Covers the 6 certification scenarios defined in CLAUDE.md theme-persistence plan.
 */

import {
  getProfileConfig,
  getPublicProfileConfig,
  saveProfileConfig,
} from "@/lib/profile/ProfileConfigService";
import { DEFAULT_PUBLIC_PROFILE_CONFIG } from "@/lib/profile/PublicProfileStyleEngine";

// ─── Prisma mock ─────────────────────────────────────────────────────────────

const mockFindUnique = jest.fn();
const mockUpsert = jest.fn();

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    publicProfileConfig: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      upsert: (...args: unknown[]) => mockUpsert(...args),
    },
  },
}));

// ─── Test helpers ─────────────────────────────────────────────────────────────

const FREE_PACKS = ["tmi_classic", "tmi_dark", "tmi_neon"];

function makeRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "cfg_1",
    userId: "user_1",
    themeColor: "#FF2DAA",
    activeStylePackId: "tmi_dark",
    animationIntensity: "LOW",
    layout: "SINGLE_COL",
    visibleModules: ["ABOUT", "MEDIA"],
    statusMessage: "Hello World",
    pinnedItems: [],
    published: true,
    ...overrides,
  };
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("ProfileConfigService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. profileConfigDefault — GET returns defaults when no config exists
  it("returns defaults when no config row exists", async () => {
    mockFindUnique.mockResolvedValueOnce(null);
    const cfg = await getProfileConfig("user_new");
    expect(cfg.themeColor).toBe(DEFAULT_PUBLIC_PROFILE_CONFIG.accentColor);
    expect(cfg.activeStylePackId).toBe(DEFAULT_PUBLIC_PROFILE_CONFIG.activeStylePackId);
    expect(cfg.published).toBe(true);
  });

  // 2. profileConfigSave — PUT persists and GET returns same data
  it("saves and returns the persisted config", async () => {
    const saved = makeRow({ themeColor: "#AA2DFF" });
    mockUpsert.mockResolvedValueOnce(saved);

    const result = await saveProfileConfig("user_1", "free", { accentColor: "#AA2DFF" });
    expect(result.ok).toBe(true);
    expect(result.config?.themeColor).toBe("#AA2DFF");
    expect(mockUpsert).toHaveBeenCalledTimes(1);
  });

  // 3. FREE PUBLIC PROFILE SYSTEM LAW — every style pack is free for every account.
  it("allows a free-tier account to set a former tier-gated pack", async () => {
    mockFindUnique.mockResolvedValueOnce(makeRow());
    mockUpsert.mockResolvedValueOnce(makeRow({ activeStylePackId: "vice_neon" }));
    const result = await saveProfileConfig("user_1", "free", {
      activeStylePackId: "vice_neon",
    });
    expect(result.ok).toBe(true);
    expect(result.config?.activeStylePackId).toBe("vice_neon");
  });

  // 4. FREE PUBLIC PROFILE SYSTEM LAW — former paid packs carry no paywall either.
  it("allows a free-tier account to set a former paid pack", async () => {
    mockFindUnique.mockResolvedValueOnce(makeRow());
    mockUpsert.mockResolvedValueOnce(makeRow({ activeStylePackId: "submarine" }));
    const result = await saveProfileConfig("user_1", "free", {
      activeStylePackId: "submarine",
    });
    expect(result.ok).toBe(true);
    expect(result.config?.activeStylePackId).toBe("submarine");
  });

  // 5. profileConfigThemePersists — themeColor change survives: saved value returned
  it("persists themeColor change and returns new value from DB row", async () => {
    const saved = makeRow({ themeColor: "#FFD700" });
    mockUpsert.mockResolvedValueOnce(saved);
    const result = await saveProfileConfig("user_1", "free", { accentColor: "#FFD700" });
    expect(result.ok).toBe(true);
    expect(result.config?.themeColor).toBe("#FFD700");
  });

  // 6. profileConfigPublicReadback — unpublished draft → visitor gets defaults
  it("returns defaults for visitor when config is unpublished", async () => {
    mockFindUnique.mockResolvedValueOnce(makeRow({ published: false, themeColor: "#secret" }));
    const cfg = await getPublicProfileConfig("user_1");
    // Visitor should see defaults, not the owner's unpublished draft color
    expect(cfg.themeColor).toBe(DEFAULT_PUBLIC_PROFILE_CONFIG.accentColor);
    expect(cfg.published).toBe(false);
  });

  // Bonus: invalid themeColor → sanitised to default
  it("sanitises invalid hex themeColor to default", async () => {
    const saved = makeRow({ themeColor: DEFAULT_PUBLIC_PROFILE_CONFIG.accentColor });
    mockUpsert.mockResolvedValueOnce(saved);
    const result = await saveProfileConfig("user_1", "free", { accentColor: "not-a-color" as string });
    expect(result.ok).toBe(true);
    // upsert was called — invalid color was replaced with default
    const upsertArgs = mockUpsert.mock.calls[0][0] as { update: { themeColor: string } };
    expect(upsertArgs.update.themeColor).toBe(DEFAULT_PUBLIC_PROFILE_CONFIG.accentColor);
  });

  // Bonus: FREE tier can use free packs
  it("allows a free-tier account to set a free style pack", async () => {
    const saved = makeRow({ activeStylePackId: "tmi_neon" });
    mockUpsert.mockResolvedValueOnce(saved);
    const result = await saveProfileConfig("user_1", "free", {
      activeStylePackId: "tmi_neon",
    });
    expect(result.ok).toBe(true);
    expect(result.config?.activeStylePackId).toBe("tmi_neon");
  });

  // Status line is the hero-visible field that genuinely round-trips today.
  it("persists a status line change and reads it back", async () => {
    mockFindUnique.mockResolvedValueOnce(makeRow());
    mockUpsert.mockResolvedValueOnce(makeRow({ statusMessage: "Back in the studio" }));
    const result = await saveProfileConfig("user_1", "free", { statusMessage: "Back in the studio" });
    expect(result.ok).toBe(true);
    expect(result.config?.statusMessage).toBe("Back in the studio");

    mockFindUnique.mockResolvedValueOnce(makeRow({ statusMessage: "Back in the studio" }));
    const reread = await getProfileConfig("user_1");
    expect(reread.statusMessage).toBe("Back in the studio");
  });

  it("clears the status line when saved as null", async () => {
    mockFindUnique.mockResolvedValueOnce(makeRow());
    mockUpsert.mockResolvedValueOnce(makeRow({ statusMessage: null }));
    const result = await saveProfileConfig("user_1", "free", { statusMessage: null });
    expect(result.ok).toBe(true);
    expect(result.config?.statusMessage).toBeNull();
  });

  it("truncates an over-long status line to 120 characters", async () => {
    mockFindUnique.mockResolvedValueOnce(makeRow());
    mockUpsert.mockResolvedValueOnce(makeRow());
    await saveProfileConfig("user_1", "free", { statusMessage: "x".repeat(200) });
    const upsertArgs = mockUpsert.mock.calls[0][0] as { update: { statusMessage: string } };
    expect(upsertArgs.update.statusMessage).toHaveLength(120);
  });

  it("preserves an intentionally empty visible-module list", async () => {
    mockFindUnique.mockResolvedValueOnce(makeRow({ visibleModules: [] }));
    const cfg = await getProfileConfig("user_1");
    expect(cfg.visibleModules).toEqual([]);
  });
});
