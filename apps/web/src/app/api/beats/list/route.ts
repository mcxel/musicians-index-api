export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";

/**
 * GET /api/beats/list
 * Real Prisma Beat rows only - Rule 20: no seed catalog as live inventory.
 *
 * Producer Boundary Law:
 * - Performers & producers see ONLY their own submissions (?mine=1 enforced).
 * - Admin/superadmin/owner roles may inspect the wider queue/status.
 * - Global browsing of protected Beat Locker inventory by unauthorized users is blocked.
 */
export async function GET(req: NextRequest) {
  const mine = req.nextUrl.searchParams.get("mine") === "1";
  const status = req.nextUrl.searchParams.get("status")?.trim() || undefined;
  const sessionCookie = req.cookies.get("tmi_session_id")?.value;

  const auth = await getTmiAuth();
  if (!auth) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized. Log in to view Beat Locker submissions.", beats: [], total: 0 },
      { status: 401 },
    );
  }

  const role = (auth.user.role ?? "").toUpperCase();
  const isAdmin = role === "ADMIN" || role === "SUPERADMIN" || role === "OWNER";

  try {
    const where: {
      producerId?: string;
      OR?: Array<{ producerId: string }>;
      status?: string;
    } = {};

    // Enforce producer boundary: non-admins can ONLY see their own beats
    if (mine || !isAdmin) {
      if (sessionCookie && sessionCookie !== auth.user.id) {
        where.OR = [{ producerId: auth.user.id }, { producerId: sessionCookie }];
      } else {
        where.producerId = auth.user.id;
      }
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
      status: b.status,
      moderationStatus: b.moderationStatus,
      adminSubmitted: b.adminSubmitted,
      basicPrice: b.basicPrice,
      premiumPrice: b.premiumPrice,
      exclusivePrice: b.exclusivePrice,
      // FIX (2026-09-24, Step 2B.1 independent closure repair): this fell
      // back to the raw master `audioAssetUrl` whenever no transcoded
      // preview existed — reintroducing, in the producer's own Beat Locker
      // list, the exact "previewUrl = audioAssetUrl" master-leakage pattern
      // Vault Batch 1 was supposed to have eliminated everywhere (that batch
      // never reached this route). Even though this endpoint is
      // owner/admin-scoped (not a public store preview), EventPlaybackTokenAuthority's
      // own law is unconditional: the master URL is never exposed to any
      // client. Fails closed to an honest empty preview, matching the same
      // convention Batch 1 used elsewhere — no real transcoding pipeline
      // exists yet to generate a safe preview asset.
      previewUrl: b.previewUrl || "",
      createdAt: b.createdAt.toISOString(),
    }));

    return NextResponse.json({
      ok: true,
      beats,
      total: beats.length,
      boundaryEnforced: !isAdmin,
    });
  } catch (err) {
    console.error("GET /api/beats/list failed:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to load beats", beats: [], total: 0 },
      { status: 500 },
    );
  }
}
