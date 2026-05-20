import { NextResponse } from "next/server";

interface ChallengeVote {
  challengeId: string;
  voterId: string;
  contestantId: string;
  weight: number;
  castAt: string;
}

interface ChallengeResult {
  challengeId: string;
  contestants: Record<string, { votes: number; weightedScore: number; displayName: string }>;
  totalVotes: number;
  leaderId: string | null;
  status: "open" | "closed";
}

const voteStore = new Map<string, ChallengeVote[]>();
const challengeMeta = new Map<string, { status: "open" | "closed"; contestants: Record<string, string> }>();

// Seed one open challenge
challengeMeta.set("cypher-001", {
  status: "open",
  contestants: { kreach: "Kreach", kg: "KG Beats", savage: "Savage Guns" },
});

function tally(challengeId: string): ChallengeResult {
  const votes = voteStore.get(challengeId) ?? [];
  const meta = challengeMeta.get(challengeId);
  const contestants: ChallengeResult["contestants"] = {};

  for (const [id, name] of Object.entries(meta?.contestants ?? {})) {
    contestants[id] = { votes: 0, weightedScore: 0, displayName: name };
  }

  for (const v of votes) {
    if (!contestants[v.contestantId]) {
      contestants[v.contestantId] = { votes: 0, weightedScore: 0, displayName: v.contestantId };
    }
    contestants[v.contestantId].votes++;
    contestants[v.contestantId].weightedScore += v.weight;
  }

  const leaderId = Object.entries(contestants).sort(
    (a, b) => b[1].weightedScore - a[1].weightedScore
  )[0]?.[0] ?? null;

  return {
    challengeId,
    contestants,
    totalVotes: votes.length,
    leaderId,
    status: meta?.status ?? "open",
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const challengeId = searchParams.get("challengeId") ?? "cypher-001";
  return NextResponse.json(tally(challengeId));
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      challengeId: string;
      voterId: string;
      contestantId: string;
      tierMultiplier?: number;
    };

    const { challengeId, voterId, contestantId } = body;
    if (!challengeId || !voterId || !contestantId) {
      return NextResponse.json({ error: "challengeId, voterId, contestantId required" }, { status: 400 });
    }

    const meta = challengeMeta.get(challengeId);
    if (!meta) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    if (meta.status !== "open") return NextResponse.json({ error: "Challenge is closed" }, { status: 409 });

    const existing = voteStore.get(challengeId) ?? [];
    if (existing.some(v => v.voterId === voterId)) {
      return NextResponse.json({ error: "Already voted in this challenge" }, { status: 409 });
    }

    const vote: ChallengeVote = {
      challengeId,
      voterId,
      contestantId,
      weight: Math.max(1, Math.min(body.tierMultiplier ?? 1, 3)),
      castAt: new Date().toISOString(),
    };
    voteStore.set(challengeId, [...existing, vote]);

    return NextResponse.json({ success: true, result: tally(challengeId) });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
