import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { NextRequest } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { normalizeBeatTitle, titleConflictPayload } from "@/lib/beats/BeatLockerTitleAuthority";
import { emitIntelligenceEvent, createCorrelationId } from "@/lib/intelligence/TmiIntelligenceFabric";

const VALID_GENRES = ["Trap","Hip-Hop","R&B","EDM","Dance","Afrobeat","Latin","Rock","Pop","House","Drill","Reggaeton","Other"];

// Admin auto-submit pipeline — J. Paul Sanchez and other admin producers.
// No security bypass: still validates all fields and writes full audit log.
export async function POST(req: NextRequest) {
  // SECURITY (2026-09-23, Batch 2): the `?? req.cookies.get("tmi_role")`
  // fallback previously let an unauthenticated caller (auth === null) pass
  // by simply setting tmi_role=ADMIN — removed. getTmiAuth() is now the
  // sole role authority.
  const auth = await getTmiAuth();
  const role = (auth?.user.role ?? "").toUpperCase();
  if (role !== "ADMIN" && role !== "SUPERADMIN" && role !== "OWNER") {
    return NextResponse.json({ ok: false, error: "admin only" }, { status: 403 });
  }

  // Bind to DB user id — same owner key as locker-submit / beats/list?mine=1
  const actorId = auth?.user.id ?? "";
  if (!actorId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

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
  const baseTags = Array.isArray(body.tags)
    ? (body.tags as string[])
    : typeof body.tags === "string"
      ? body.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
  const stashScope =
    body.stashScope === "personal" ? "personal-stash" : "platform-catalog";
  const tags = [...new Set([...baseTags, "admin-submitted", stashScope, `producer:${producerName}`])];
  const slug           = `beat-admin-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  if (!title) {
    return NextResponse.json({ ok: false, error: "title is required" }, { status: 400 });
  }
  if (!previewUrl) {
    return NextResponse.json({ ok: false, error: "previewUrl is required" }, { status: 400 });
  }

  const normalizedTitle = normalizeBeatTitle(title);
  const titleConflict = await prisma.beat.findFirst({
    where: {
      title: { equals: title, mode: "insensitive" },
      status: { in: ["published", "LIVE", "FEATURED", "APPROVED", "SANDBOX", "AVAILABLE", "QUEUED"] },
    },
    select: { id: true, title: true, status: true },
  });
  // Also catch normalized collisions when casing/spacing differs
  if (!titleConflict) {
    const actives = await prisma.beat.findMany({
      where: { status: { in: ["published", "LIVE", "FEATURED", "APPROVED", "SANDBOX", "AVAILABLE", "QUEUED"] } },
      select: { id: true, title: true, status: true },
      take: 5000,
    });
    const hit = actives.find((b) => normalizeBeatTitle(b.title) === normalizedTitle);
    if (hit) {
      return NextResponse.json(
        titleConflictPayload({
          displayTitle: title,
          normalizedTitle,
          conflictListingId: hit.id,
        }),
        { status: 409 },
      );
    }
  } else {
    return NextResponse.json(
      titleConflictPayload({
        displayTitle: title,
        normalizedTitle,
        conflictListingId: titleConflict.id,
      }),
      { status: 409 },
    );
  }

  const correlationId = createCorrelationId("beat");
  emitIntelligenceEvent({
    eventType: "BEAT_TITLE_RESERVED",
    family: "BEAT",
    occurredAt: Date.now(),
    correlationId,
    actorId,
    actorRole: role,
    status: "RESERVED",
    payload: { title, normalizedTitle },
  });

  const beat = await prisma.beat.create({
    data: {
      producerId: actorId,
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
