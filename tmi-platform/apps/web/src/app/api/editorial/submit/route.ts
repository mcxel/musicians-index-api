import { NextRequest, NextResponse } from "next/server";
import { editorialSubmissionEngine } from "@/lib/editorial-economy/EditorialSubmissionEngine";
import { contributorAccountEngine } from "@/lib/editorial-economy/ContributorAccountEngine";
import { resolveContributorSession } from "@/lib/editorial-economy/resolveContributorSession";

export async function POST(req: NextRequest) {
  try {
    // Identity is always server-resolved from the real session — a
    // client-supplied contributorId is never trusted (it would let anyone
    // submit as anyone else's contributor account).
    const session = await resolveContributorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Sign in to submit an article." }, { status: 401 });
    }

    const body = await req.json() as {
      title: string;
      body: string;
      category: string;
      sourceUrls?: string[];
      artistSlug?: string;
      sponsorSlug?: string;
    };

    if (!body.title || !body.body || !body.category) {
      return NextResponse.json({ error: "title, body, and category are required" }, { status: 400 });
    }

    const contributorId = session.contributorId;
    await contributorAccountEngine.getOrCreate({
      contributorId,
      displayName: session.displayName,
      level: "new-contributor",
    });

    const result = await editorialSubmissionEngine.submit({
      contributorId,
      title: body.title,
      body: body.body,
      category: body.category as Parameters<typeof editorialSubmissionEngine.submit>[0]["category"],
      sourceUrls: body.sourceUrls ?? [],
      artistSlug: body.artistSlug,
      sponsorSlug: body.sponsorSlug,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 403 });
    }

    return NextResponse.json({ ok: true, submissionId: result.submission.submissionId, status: result.submission.status });
  } catch {
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
