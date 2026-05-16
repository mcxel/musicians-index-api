import { NextRequest, NextResponse } from "next/server";
import { editorialSubmissionEngine } from "@/lib/editorial-economy/EditorialSubmissionEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      title: string;
      body: string;
      category: string;
      sourceUrls?: string[];
      artistSlug?: string;
      sponsorSlug?: string;
      contributorId?: string;
    };

    if (!body.title || !body.body || !body.category) {
      return NextResponse.json({ error: "title, body, and category are required" }, { status: 400 });
    }

    const result = editorialSubmissionEngine.submit({
      contributorId: body.contributorId ?? "writer-demo",
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
