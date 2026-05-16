export type JuliusPollType = "keep" | "retire" | "return" | "premium" | "free" | "seasonal" | "event-only";
export type JuliusPollState = "open" | "closed" | "resolved";

export type JuliusOverlayPoll = {
  id: string;
  overlayId: string;
  issueId: string;
  type: JuliusPollType;
  state: JuliusPollState;
  createdAt: number;
  closesAt: number;
  result?: "approved" | "rejected";
};

type VoteChoice = "yes" | "no";

type VoteRow = {
  pollId: string;
  voterId: string;
  choice: VoteChoice;
  at: number;
};

const POLLS: JuliusOverlayPoll[] = [];
const VOTES: VoteRow[] = [];

export function createPoll(overlayId: string, issueId: string, type: JuliusPollType, durationMs = 1000 * 60 * 60 * 24) {
  const poll: JuliusOverlayPoll = {
    id: `jpoll_${Math.random().toString(36).slice(2, 10)}`,
    overlayId,
    issueId,
    type,
    state: "open",
    createdAt: Date.now(),
    closesAt: Date.now() + durationMs,
  };
  POLLS.push(poll);
  return poll;
}

export function votePoll(pollId: string, voterId: string, choice: VoteChoice) {
  const poll = POLLS.find((p) => p.id === pollId);
  if (!poll) return { ok: false, reason: "POLL_NOT_FOUND" } as const;
  if (poll.state !== "open") return { ok: false, reason: "POLL_NOT_OPEN" } as const;

  const existing = VOTES.find((v) => v.pollId === pollId && v.voterId === voterId);
  if (existing) existing.choice = choice;
  else VOTES.push({ pollId, voterId, choice, at: Date.now() });

  return { ok: true } as const;
}

export function closePoll(pollId: string) {
  const poll = POLLS.find((p) => p.id === pollId);
  if (!poll) return { ok: false, reason: "POLL_NOT_FOUND" } as const;
  poll.state = "closed";
  return { ok: true } as const;
}

export function resolvePoll(pollId: string) {
  const poll = POLLS.find((p) => p.id === pollId);
  if (!poll) return { ok: false, reason: "POLL_NOT_FOUND" } as const;
  if (poll.state === "open") return { ok: false, reason: "POLL_STILL_OPEN" } as const;

  const rows = VOTES.filter((v) => v.pollId === pollId);
  const yes = rows.filter((v) => v.choice === "yes").length;
  const no = rows.filter((v) => v.choice === "no").length;

  poll.result = yes >= no ? "approved" : "rejected";
  poll.state = "resolved";
  return { ok: true, result: poll.result, yes, no } as const;
}

export function applyPollResult(pollId: string) {
  const poll = POLLS.find((p) => p.id === pollId);
  if (!poll) return { ok: false, reason: "POLL_NOT_FOUND" } as const;
  if (poll.state !== "resolved" || !poll.result) return { ok: false, reason: "POLL_NOT_RESOLVED" } as const;

  const approved = poll.result === "approved";
  const evolutionAction =
    poll.type === "retire" && approved
      ? "RETIRE_OVERLAY"
      : poll.type === "return" && approved
      ? "RETURN_OVERLAY"
      : poll.type === "premium" && approved
      ? "SET_PREMIUM"
      : poll.type === "free" && approved
      ? "SET_FREE"
      : poll.type === "seasonal" && approved
      ? "SET_SEASONAL"
      : poll.type === "event-only" && approved
      ? "SET_EVENT_ONLY"
      : "NO_CHANGE";

  return {
    ok: true,
    overlayId: poll.overlayId,
    issueId: poll.issueId,
    action: evolutionAction,
    approved,
  } as const;
}

export function listJuliusPolls() {
  return POLLS;
}

export function getPollTallies(pollId: string) {
  const rows = VOTES.filter((v) => v.pollId === pollId);
  return {
    yes: rows.filter((v) => v.choice === "yes").length,
    no: rows.filter((v) => v.choice === "no").length,
    total: rows.length,
  };
}
