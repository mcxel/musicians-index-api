import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";

const VALID_GENRES = ["Trap","Hip-Hop","R&B","EDM","Dance","Afrobeat","Latin","Rock","Pop","House","Drill","Reggaeton","Other"];

// Admin auto-submit pipeline — J. Paul Sanchez and other admin producers.
// No security bypass: still validates all fields and writes full audit log.
export async function POST(req: NextRequest) {
  const role = req.cookies.get("tmi_role")?.value ?? "";
  if (role !== "ADMIN" && role !== "admin") {
    return NextResponse.json({ ok: false, error: "admin only" }, { status: 403 });
  }

  const actorId = req.cookies.get("tmi_session_id")?.value ?? "";

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch { /* no body */ }

  const title          = typeof body.title === "string" ? body.title.trim() : "";
  const genre          = VALID_GENRES.includes(body.genre as string) ? (body.genre as string) : "Other";
  const bpm            = Math.min(Math.max(Math.floor(Number(body.bpm ?? 120)), 60), 220);
  const key            = typeof body.key === "string" ? body.key : null;
  const previewUrl     = typeof body.previewUrl === "string" ? body.previewUrl : "";
  const taggedUrl      = typeof body.taggedUrl === "string" ? body.taggedUrl : previewUrl;
  const basicPrice     = Math.floor(Number(body.basicPrice ?? 2999));
  const premiumPrice   = Math.floor(Number(body.premiumPrice ?? 7999));
  const exclusivePrice = body.exclusivePrice != null ? Math.floor(Number(body.exclusivePrice)) : null;
  const producerName   = typeof body.producerName === "string" ? body.producerName : "J. Paul Sanchez";
  // Auto-tags: mark admin submission and producer attribution
  const baseTags       = Array.isArray(body.tags) ? (body.tags as string[]) : [];
  const tags           = [...new Set([...baseTags, "admin-submitted", `producer:${producerName}`])];
  const slug           = `beat-admin-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  if (!title) {
    return NextResponse.json({ ok: false, error: "title is required" }, { status: 400 });
  }
  if (!previewUrl) {
    return NextResponse.json({ ok: false, error: "previewUrl is required" }, { status: 400 });
  }

  const beat = await prisma.beat.create({
    data: {
      producerId: actorId || "admin",
      slug,
      title,
      genre,
      bpm,
      key,
      tags,
      previewUrl,
      taggedUrl,
      basicPrice,
      premiumPrice,
      exclusivePrice,
      producerName,
      status: "published",
      moderationStatus: "APPROVED",
      adminSubmitted: true,
    },
  });

  // Audit log — always written for admin beats (no bypass)
  try {
    if (actorId) {
      await prisma.auditLog.create({
        data: {
          action: "BEAT_ADMIN_SUBMITTED",
          actorId,
          targetId: beat.id,
          details: {
            beatTitle: beat.title,
            producerName,
            genre: beat.genre,
            tags: beat.tags,
            submittedAt: new Date().toISOString(),
          },
        },
      });
    }
  } catch {
    // Audit failure must not block the beat creation
    console.error("[admin-submit] audit log write failed for beat", beat.id);
  }

  return NextResponse.json({ ok: true, beat }, { status: 201 });
}
