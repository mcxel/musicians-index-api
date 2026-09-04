/**
 * GameShowEngine — contract (Contestant / Round / Turn / Timer / PrizeLedger).
 * Scaffold only — does not mint fake prizes or fabricate winners.
 */

export interface GameShowContestant {
  contestantId: string;
  displayName: string;
  score: number;
}

export interface GameShowRound {
  roundId: string;
  index: number;
  status: "PENDING" | "ACTIVE" | "COMPLETE";
}

export interface GameShowTurn {
  turnId: string;
  roundId: string;
  contestantId: string;
  startedAtMs: number | null;
  endsAtMs: number | null;
}

export interface PrizeLedgerEntry {
  entryId: string;
  label: string;
  /** Cash only when Rule 23 Cash Prize Mode unlocked — scaffold stores intent only */
  currencyKind: "XP" | "CREDIT" | "CASH_GATED";
  amount: number;
  awardedToContestantId: string | null;
  authoritativeGrantId: string | null;
}

export interface GameShowEngine {
  addContestant(c: Omit<GameShowContestant, "score">): GameShowContestant;
  startRound(index: number): GameShowRound;
  startTurn(roundId: string, contestantId: string, durationMs: number): GameShowTurn;
  getTimerRemainingMs(turn: GameShowTurn, nowMs: number): number;
  recordPrizeIntent(entry: Omit<PrizeLedgerEntry, "awardedToContestantId" | "authoritativeGrantId">): PrizeLedgerEntry;
  /** Award only when authoritative grant id provided — never invent cash */
  awardPrize(entryId: string, contestantId: string, authoritativeGrantId: string): PrizeLedgerEntry;
  listContestants(): GameShowContestant[];
  listPrizeLedger(): PrizeLedgerEntry[];
}

export function createGameShowEngineStub(): GameShowEngine {
  const contestants: GameShowContestant[] = [];
  const rounds: GameShowRound[] = [];
  const turns: GameShowTurn[] = [];
  const ledger: PrizeLedgerEntry[] = [];

  return {
    addContestant(c) {
      const row = { ...c, score: 0 };
      contestants.push(row);
      return row;
    },
    startRound(index) {
      const round: GameShowRound = {
        roundId: `round-${index}`,
        index,
        status: "ACTIVE",
      };
      rounds.forEach((r) => {
        if (r.status === "ACTIVE") r.status = "COMPLETE";
      });
      rounds.push(round);
      return round;
    },
    startTurn(roundId, contestantId, durationMs) {
      const now = Date.now();
      const turn: GameShowTurn = {
        turnId: `turn-${turns.length + 1}`,
        roundId,
        contestantId,
        startedAtMs: now,
        endsAtMs: now + durationMs,
      };
      turns.push(turn);
      return turn;
    },
    getTimerRemainingMs(turn, nowMs) {
      if (turn.endsAtMs == null) return 0;
      return Math.max(0, turn.endsAtMs - nowMs);
    },
    recordPrizeIntent(entry) {
      const row: PrizeLedgerEntry = {
        ...entry,
        awardedToContestantId: null,
        authoritativeGrantId: null,
      };
      ledger.push(row);
      return row;
    },
    awardPrize(entryId, contestantId, authoritativeGrantId) {
      if (!authoritativeGrantId) {
        throw new Error("PrizeLedger requires authoritativeGrantId — no fabricated awards");
      }
      const row = ledger.find((e) => e.entryId === entryId);
      if (!row) throw new Error(`Unknown prize entry: ${entryId}`);
      row.awardedToContestantId = contestantId;
      row.authoritativeGrantId = authoritativeGrantId;
      return row;
    },
    listContestants() {
      return [...contestants];
    },
    listPrizeLedger() {
      return [...ledger];
    },
  };
}
