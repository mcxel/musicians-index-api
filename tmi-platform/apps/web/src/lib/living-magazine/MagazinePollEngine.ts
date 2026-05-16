// MagazinePollEngine
// Polls and votes embedded in magazine spreads.

export type PollStatus = "open" | "closed" | "scheduled";

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface MagazinePoll {
  id: string;
  question: string;
  options: PollOption[];
  status: PollStatus;
  totalVotes: number;
  opensAt?: string;
  closesAt?: string;
  creditCostPerVote: number;  // 0 = free
  issueId?: string;
  spreadIndex?: number;
  accentColor: string;
}

export function createPoll(
  id: string,
  question: string,
  options: string[],
  creditCostPerVote = 50,
): MagazinePoll {
  return {
    id,
    question,
    options: options.map((text, i) => ({ id: `${id}-opt-${i}`, text, votes: 0 })),
    status: "open",
    totalVotes: 0,
    creditCostPerVote,
    accentColor: "#AA2DFF",
  };
}

export function castVote(
  poll: MagazinePoll,
  optionId: string,
): MagazinePoll {
  const options = poll.options.map(o =>
    o.id === optionId ? { ...o, votes: o.votes + 1 } : o,
  );
  return { ...poll, options, totalVotes: poll.totalVotes + 1 };
}

export function getLeadingOption(poll: MagazinePoll): PollOption | null {
  if (!poll.options.length) return null;
  return poll.options.reduce((max, o) => (o.votes > max.votes ? o : max));
}

export function getPercentages(poll: MagazinePoll): Array<{ id: string; pct: number }> {
  if (poll.totalVotes === 0) return poll.options.map(o => ({ id: o.id, pct: 0 }));
  return poll.options.map(o => ({
    id: o.id,
    pct: Math.round((o.votes / poll.totalVotes) * 100),
  }));
}
