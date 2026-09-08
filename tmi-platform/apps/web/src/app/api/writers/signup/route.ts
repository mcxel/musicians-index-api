import { NextRequest, NextResponse } from "next/server";
import { contributorAccountEngine } from "@/lib/editorial-economy/ContributorAccountEngine";
import { resolveContributorSession } from "@/lib/editorial-economy/resolveContributorSession";

export async function POST(req: NextRequest) {
  try {
    // The contributor account is always keyed to the real signed-in user —
    // never a freshly-minted random id disconnected from any real account.
    const session = await resolveContributorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Sign in to apply as a contributor." }, { status: 401 });
    }

    const body = await req.json() as {
      displayName?: string;
      email?: string;
      bio?: string;
      sampleUrl?: string;
    };

    const account = await contributorAccountEngine.getOrCreate({
      contributorId: session.contributorId,
      displayName: (body.displayName?.trim() || session.displayName),
      level: "new-contributor",
    });

    return NextResponse.json({ ok: true, contributorId: account.contributorId, level: account.level });
  } catch {
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
