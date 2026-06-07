import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

const VALID_GENRES = ["Trap","Hip-Hop","R&B","EDM","Dance","Afrobeat","Latin","Rock","Pop","House","Drill","Reggaeton","Other"];

async function parseBody(req: NextRequest): Promise<Record<string, string>> {
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("multipart/form-data") || ct.includes("application/x-www-form-urlencoded")) {
    const fd = await req.formData();
    const out: Record<string, string> = {};
    fd.forEach((v, k) => { if (typeof v === "string") out[k] = v; });
    return out;
  }
  try { return (await req.json()) as Record<string, string>; } catch { return {}; }
}

export async function POST(req: NextRequest) {
  const producerId = req.cookies.get("tmi_session_id")?.value ?? "anonymous";
  const body = await parseBody(req);

  const title    = (body.title ?? "").trim();
  const genre    = VALID_GENRES.includes(body.genre) ? body.genre : "Other";
  const bpm      = Math.min(Math.max(Math.floor(Number(body.bpm ?? 120)), 60), 220);
  const key      = body.key || null;
  const tags     = (body.tags ?? "").split(",").map((t: string) => t.trim()).filter(Boolean);
  const previewUrl = body.previewUrl || body.audioUrl || body.fileUrl || "";
  const taggedUrl  = body.taggedUrl || previewUrl || "pending";
  const basicPrice     = Math.floor(Number(body.basicPrice     ?? 2999));
  const premiumPrice   = Math.floor(Number(body.premiumPrice   ?? 7999));
  const exclusivePrice = body.exclusivePrice ? Math.floor(Number(body.exclusivePrice)) : null;
  const producerName   = body.producerName || null;
  const slug           = `beat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  if (!title) {
    return NextResponse.json({ ok: false, error: "title is required" }, { status: 400 });
  }

  const beat = await prisma.beat.create({
    data: {
      producerId,
      slug,
      title,
      genre,
      bpm,
      key,
      tags,
      previewUrl: previewUrl || "pending",
      taggedUrl,
      basicPrice,
      premiumPrice,
      exclusivePrice,
      producerName,
      status: "draft",
      moderationStatus: "PENDING",
      adminSubmitted: false,
    },
  });

  return NextResponse.json({ ok: true, beat }, { status: 201 });
}
