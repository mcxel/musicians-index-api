import { NextRequest, NextResponse } from "next/server";
import { articleReviewQueueEngine } from "@/lib/editorial-economy/ArticleReviewQueueEngine";
import { resolveContributorSession } from "@/lib/editorial-economy/resolveContributorSession";

export async function POST(req: NextRequest) {
  try {
    const session = await resolveContributorSession(req);
    if (!session) {
      return NextResponse.json({ error: "Sign in to review submissions." }, { status: 401 });
    }

    const body = (await req.json()) as { submissionId?: string; action?: "approve" | "reject"; reason?: string };
    if (!body.submissionId || (body.action !== "approve" && body.action !== "reject")) {
      return NextResponse.json({ error: "submissionId and action are required" }, { status: 400 });
    }

    const result =
      body.action === "approve"
        ? await articleReviewQueueEngine.approve(body.submissionId, session.contributorId)
        : await articleReviewQueueEngine.reject(body.submissionId, session.contributorId, body.reason ?? "Rejected");

    if (!result.ok) {
      // insufficient-role / reviewer-blocked are real trust-gate denials, not
      // server errors — 403 tells the client why the button didn't work.
      return NextResponse.json({ error: result.reason }, { status: 403 });
    }

    return NextResponse.json({ ok: true, submission: result.submission });
  } catch {
    return NextResponse.json({ error: "Review action failed" }, { status: 500 });
  }
}
