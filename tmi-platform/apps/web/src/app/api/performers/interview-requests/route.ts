/**
 * Phase 1 interview request stub — list + request only.
 * No WebRTC / Zoom studio. Honest empty when none exist.
 * In-memory store (process lifetime) — real messaging/editorial wiring later.
 */

export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

export type InterviewRequestStatus = "pending" | "accepted" | "declined";

export interface InterviewRequest {
  id: string;
  performerSlug: string;
  requesterName: string;
  requesterRole: string;
  note: string;
  status: InterviewRequestStatus;
  createdAt: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __tmiInterviewRequests: InterviewRequest[] | undefined;
}

function store(): InterviewRequest[] {
  if (!globalThis.__tmiInterviewRequests) {
    globalThis.__tmiInterviewRequests = [];
  }
  return globalThis.__tmiInterviewRequests;
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("performerSlug")?.trim();
  const all = store();
  const list = slug
    ? all.filter((r) => r.performerSlug === slug)
    : all;
  return NextResponse.json({
    ok: true,
    requests: list,
    empty: list.length === 0,
  });
}

export async function POST(req: NextRequest) {
  let body: {
    performerSlug?: string;
    requesterName?: string;
    requesterRole?: string;
    note?: string;
  } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const performerSlug = body.performerSlug?.trim();
  if (!performerSlug) {
    return NextResponse.json({ error: "performerSlug required" }, { status: 400 });
  }

  const entry: InterviewRequest = {
    id: `ivw_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    performerSlug,
    requesterName: body.requesterName?.trim() || "Writer",
    requesterRole: body.requesterRole?.trim() || "WRITER",
    note: body.note?.trim() || "",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  store().unshift(entry);

  return NextResponse.json({ ok: true, request: entry }, { status: 201 });
}
