// apps/web/src/adapters/homepage/weeklyCrown.adapter.ts
// Current weekly crown holder + vote counts + animation trigger.

export interface CrownState {
  holderId: string;
  holderName: string;
  holderSlug: string;
  holderGenre: string;
  holderCity: string;
  weekNumber: number;
  voteCount: number;
  voteCountUpdatedAt: Date;
  isVotingLive: boolean;
  isNewWinner: boolean;         // crown just changed — trigger animation
  animationDurationMs: 3000;   // Platform Law: always 3000ms
  previousHolderName?: string;
  weeklyChange: number;        // how votes changed vs last check
  clipUrl?: string;
  avatarUrl?: string;
}

export const CROWN_FALLBACK: CrownState = {
  holderId: "crown-holder-seed",
  holderName: "Crown Holder",
  holderSlug: "crown-holder",
  holderGenre: "Cypher",
  holderCity: "Chico",
  weekNumber: 1,
  voteCount: 847,
  voteCountUpdatedAt: new Date(),
  isVotingLive: true,
  isNewWinner: false,
  animationDurationMs: 3000,
  weeklyChange: 23,
};

let _mockVoteCount = 847;
export async function fetchCrownState(): Promise<CrownState> {
  try {
    // Blackbox: const res = await fetch("/api/scoring/crown"); return await res.json();
    _mockVoteCount += Math.floor(Math.random() * 3);
    return { ...CROWN_FALLBACK, voteCount: _mockVoteCount, voteCountUpdatedAt: new Date(), weeklyChange: _mockVoteCount - 847 };
  } catch {
    return CROWN_FALLBACK;
  }
}

// Polling: updates crown vote count every 5 seconds on homepage
export function startCrownPolling(
  onUpdate: (state: CrownState) => void,
  intervalMs = 5000
): () => void {
  const id = setInterval(async () => {
    const state = await fetchCrownState();
    onUpdate(state);
  }, intervalMs);
  return () => clearInterval(id);
}
