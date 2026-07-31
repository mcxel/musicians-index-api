export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/beats/list
 * Real Prisma Beat rows only — Rule 20: no seed catalog as live inventory.
 * ?mine=1 → producerId = session user
 * ?status=draft|published|…
 */
export async function GET(req: NextRequest) {
  const mine = req.nextUrl.searchParams.get("mine") === "1";
  const status = req.nextUrl.searchParams.get("status")?.trim() || undefined;
  const sessionId = req.cookies.get("tmi_session_id")?.value;

  try {
    const where: {
      producerId?: string;
      status?: string;
    } = {};

    if (mine) {
      if (!sessionId) {
        return NextResponse.json(
          { ok: false, error: "Unauthorized. Log in to view your Beat Locker.", beats: [], total: 0 },
          { status: 401 },
        );
      }
      where.producerId = sessionId;
    }
    if (status) where.status = status;

    const rows = await prisma.beat.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const beats = rows.map((b) => ({
      id: b.id,
      title: b.title,
      producer: b.producerName ?? b.producerId,
      producerId: b.producerId,
      producerName: b.producerName,
      genre: b.genre,
      bpm: b.bpm,
      key: b.key,
      tags: b.tags,
      previewUrl: b.previewUrl,
      price: b.basicPrice / 100,
      basicPrice: b.basicPrice,
      premiumPrice: b.premiumPrice,
      exclusivePrice: b.exclusivePrice,
      available: b.status === "published" && b.moderationStatus === "APPROVED",
      status: b.status,
      moderationStatus: b.moderationStatus,
      adminSubmitted: b.adminSubmitted,
      createdAt: b.createdAt.toISOString(),
    }));

    return NextResponse.json({ ok: true, beats, total: beats.length });
  } catch (error) {
    console.error("[beats/list] GET failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to load Beat Locker from database",
        beats: [],
        total: 0,
      },
      { status: 500 },
    );
  }
}
