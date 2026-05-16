import { NextRequest, NextResponse } from "next/server";
import { contributorAccountEngine } from "@/lib/editorial-economy/ContributorAccountEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      displayName: string;
      email: string;
      bio?: string;
      sampleUrl?: string;
    };

    if (!body.displayName || !body.email) {
      return NextResponse.json({ error: "displayName and email are required" }, { status: 400 });
    }

    const contributorId = `writer-${Date.now()}`;
    contributorAccountEngine.create({ contributorId, displayName: body.displayName, level: "new-contributor" });

    return NextResponse.json({ ok: true, contributorId, level: "new-contributor" });
  } catch {
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
