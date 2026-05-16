export type TmiOverlayVoteKind = "yes" | "no" | "return-next-month" | "retire" | "premium" | "free";

export type TmiOverlayVoteRecord = {
  overlayId: string;
  userId: string;
  vote: TmiOverlayVoteKind;
  createdAt: number;
};

const VOTES: TmiOverlayVoteRecord[] = [];

export function castOverlayVote(overlayId: string, userId: string, vote: TmiOverlayVoteKind): TmiOverlayVoteRecord {
  const row: TmiOverlayVoteRecord = { overlayId, userId, vote, createdAt: Date.now() };
  VOTES.push(row);
  return row;
}

export function listOverlayVotes(overlayId: string): TmiOverlayVoteRecord[] {
  return VOTES.filter((row) => row.overlayId === overlayId);
}
