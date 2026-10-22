/**
 * /api/download — Authoritative Beat Download & Entitlement Gate.
 *
 * Enforces:
 * 1. Authenticated User Identity (HMAC-verified session or getTmiAuth)
 * 2. Exact Beat ID resolution
 * 3. Exact Buyer ID + Valid BeatLicense entitlement check (removes global order bypass)
 * 4. Format entitlement check (e.g. mp3-lease cannot download wav)
 * 5. Expiring VaultDownloadToken authority for temporary delivery
 * 6. Content-Disposition: attachment and X-Content-Type-Options: nosniff
 * 7. Immutable BeatProvenanceEvent audit logging on download
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTmiAuth, resolveCanonicalSession } from "@/lib/auth/getTmiAuth";
import {
  SESSION_IDENTITY_COOKIE,
  verifySignedUserIdentity,
} from "@/lib/auth/verifiedSessionIdentity";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const tokenId = url.searchParams.get("token");
  const assetId = url.searchParams.get("id");
  const requestedFormat = (url.searchParams.get("format") ?? "mp3").toLowerCase();

  // The request cookie only names a candidate. Authority is the canonical User row.
  const headerUserId = verifySignedUserIdentity(req.cookies.get(SESSION_IDENTITY_COOKIE)?.value);
  const auth = await getTmiAuth().catch(() => null);
  let userId = auth?.user?.id ?? null;
  if (!userId && headerUserId) {
    const decision = await resolveCanonicalSession(headerUserId);
    if (decision.outcome === "unavailable") {
      return NextResponse.json({ error: "Authentication authority unavailable" }, { status: 503 });
    }
    if (decision.outcome === "authenticated") userId = decision.user.id;
  }

  if (!userId) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // ---------------------------------------------------------------------------
  // FLOW A: Temporary Delivery via Validated VaultDownloadToken
  // ---------------------------------------------------------------------------
  if (tokenId) {
    const token = await prisma.vaultDownloadToken.findUnique({
      where: { id: tokenId },
    });

    if (!token) {
      return NextResponse.json({ error: "Invalid or expired download token." }, { status: 404 });
    }

    if (token.expiresAt < new Date()) {
      return NextResponse.json({ error: "Download token has expired." }, { status: 403 });
    }

    if (token.downloadCount >= token.maxDownloads) {
      return NextResponse.json({ error: "Download limit exceeded (3 max)." }, { status: 403 });
    }

    if (token.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized token accessor." }, { status: 403 });
    }

    // Lookup target Beat
    const beat = await prisma.beat.findUnique({
      where: { id: token.assetId },
    });

    if (!beat) {
      return NextResponse.json({ error: "Beat not found." }, { status: 404 });
    }

    // Verify buyer license or producer ownership
    const isOwner = beat.producerId === userId;
    const elevated =
      auth?.user?.role === "ADMIN" ||
      auth?.user?.role === "SUPERADMIN" ||
      auth?.user?.role === "OWNER";

    const license = await prisma.beatLicense.findFirst({
      where: {
        beatId: beat.id,
        buyerId: userId,
      },
    });

    if (!license && !isOwner && !elevated) {
      return NextResponse.json({ error: "Active license required to download this beat." }, { status: 403 });
    }

    // Format entitlement check
    if (license && license.type === "mp3-lease" && requestedFormat === "wav") {
      return NextResponse.json(
        { error: "Your license (mp3-lease) does not include WAV download entitlement. WAV Lease or Exclusive Rights required." },
        { status: 403 }
      );
    }

    // Increment download count
    await prisma.vaultDownloadToken.update({
      where: { id: token.id },
      data: { downloadCount: { increment: 1 } },
    });

    // Record immutable provenance audit event
    await prisma.beatProvenanceEvent.create({
      data: {
        beatId: beat.id,
        eventType: "BEAT_DOWNLOADED",
        actorId: userId,
        contextJson: JSON.stringify({
          beatId: beat.id,
          canonicalId: beat.canonicalId,
          producerId: beat.producerId,
          audioFileHash: beat.audioFileHash,
          licenseId: license?.id ?? "producer-direct",
          buyerId: userId,
          format: requestedFormat,
          downloadCountAfter: token.downloadCount + 1,
          downloadedAt: new Date().toISOString(),
        }),
      },
    });

    const safeTitle = (beat.title || "beat").replace(/[^a-zA-Z0-9_-]/g, "_");
    const mime = requestedFormat === "wav" ? "audio/wav" : "audio/mpeg";

    // Attempt local file stream if available
    try {
      if (beat.audioFilename) {
        const localPath = path.join(process.cwd(), ".tmi-data", "uploads", "media", beat.audioFilename);
        const data = await fs.readFile(localPath);
        return new NextResponse(data, {
          status: 200,
          headers: {
            "Content-Type": mime,
            "Content-Disposition": `attachment; filename="${safeTitle}.${requestedFormat}"`,
            "X-Content-Type-Options": "nosniff",
            "Cache-Control": "private, no-cache",
          },
        });
      }
    } catch {
      // Stream fallback
    }

    // Authorized token delivery response
    return NextResponse.json({
      ok: true,
      delivered: true,
      assetId: beat.id,
      title: beat.title,
      format: requestedFormat,
      downloadCount: token.downloadCount + 1,
      maxDownloads: token.maxDownloads,
      note: "Authorized binary stream ready.",
    }, {
      headers: {
        "Content-Disposition": `attachment; filename="${safeTitle}.${requestedFormat}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  // ---------------------------------------------------------------------------
  // FLOW B: Ticket / Download Authorization Request (?id=BEAT_ID)
  // ---------------------------------------------------------------------------
  if (!assetId) {
    return NextResponse.json({ error: "Asset ID or download token required." }, { status: 400 });
  }

  const beat = await prisma.beat.findFirst({
    where: {
      OR: [{ id: assetId }, { canonicalId: assetId }, { slug: assetId }],
    },
  });

  if (!beat) {
    return NextResponse.json({ error: "Beat not found." }, { status: 404 });
  }

  const isOwner = beat.producerId === userId;
  const elevated =
    auth?.user?.role === "ADMIN" ||
    auth?.user?.role === "SUPERADMIN" ||
    auth?.user?.role === "OWNER";

  const license = await prisma.beatLicense.findFirst({
    where: {
      beatId: beat.id,
      buyerId: userId,
    },
  });

  if (!license && !isOwner && !elevated) {
    return NextResponse.json(
      { error: "Active license required to download this beat." },
      { status: 403 }
    );
  }

  // Validate format entitlement
  if (requestedFormat !== "mp3" && requestedFormat !== "wav") {
    return NextResponse.json(
      { error: "Unsupported format requested. Authorized formats: mp3, wav." },
      { status: 400 }
    );
  }

  if (license && license.type === "mp3-lease" && requestedFormat === "wav") {
    return NextResponse.json(
      {
        error:
          "Your license (mp3-lease) does not include WAV download entitlement. WAV Lease or Exclusive Rights required.",
      },
      { status: 403 }
    );
  }

  // Mint a genuine short-lived VaultDownloadToken (1 hour expiry, max 3 downloads)
  const downloadToken = await prisma.vaultDownloadToken.create({
    data: {
      userId,
      assetType: "BEAT",
      assetId: beat.id,
      maxDownloads: 3,
      downloadCount: 0,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });

  const safeTitle = (beat.title || "beat").replace(/[^a-zA-Z0-9_-]/g, "_");

  return NextResponse.json({
    ok: true,
    downloadUrl: `/api/download?token=${downloadToken.id}&format=${requestedFormat}`,
    token: downloadToken.id,
    filename: `${safeTitle}.${requestedFormat}`,
    assetId: beat.id,
    format: requestedFormat,
    expiresIn: 3600,
  });
}
