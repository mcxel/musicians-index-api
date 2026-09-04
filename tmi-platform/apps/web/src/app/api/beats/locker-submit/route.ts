export const dynamic = "force-dynamic";

/**
 * POST /api/beats/locker-submit
 * Compact Beat Locker path for performers (Rule 19 Submission Vault).
 * Marketplace list is optional via price — Competition Vault assign stays separate.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { DEFAULT_LICENSE_PRICES } from "@/lib/beats/BeatStoreCommerceEngine";
import { buildBeatDropInventory } from "@/lib/beats/BeatInventoryEngine";
import { persistUploadedMediaFile } from "@/lib/media/persistUploadedMedia";
import { isDurablePlayableMediaUrl } from "@/lib/media/durablePlayableUrl";

const VALID_GENRES = [
  "Trap",
  "Hip-Hop",
  "R&B",
  "EDM",
  "Dance",
  "Afrobeat",
  "Latin",
  "Rock",
  "Pop",
  "House",
  "Drill",
  "Reggaeton",
  "Other",
];

const ALLOWED_EXT = new Set([".mp3", ".wav", ".aiff", ".aif", ".flac", ".m4a", ".ogg"]);

function getExt(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i).toLowerCase();
}

export async function POST(req: NextRequest) {
  const auth = await getTmiAuth();
  if (!auth) {
    return NextResponse.json({ ok: false, error: "Log in to submit to Beat Locker." }, { status: 401 });
  }

  const role = (auth.user.role ?? "").toUpperCase();
  const allowed =
    role === "PERFORMER" ||
    role === "PRODUCER" ||
    role === "BEAT_CREATOR" ||
    role === "ADMIN" ||
    role === "SUPERADMIN" ||
    role === "OWNER" ||
    role === "BAND";
  if (!allowed) {
    return NextResponse.json(
      { ok: false, error: "Performer / producer role required for Beat Locker." },
      { status: 403 },
    );
  }

  const contentType = req.headers.get("content-type") ?? "";
  let title = "";
  let genre = "Hip-Hop";
  let bpm = 120;
  let key: string | null = null;
  let tags: string[] = [];
  let broadcastTag = "";
  let previewUrl = "";
  let basicPrice = DEFAULT_LICENSE_PRICES.non_exclusive;
  let listForSale = false;
  let stashScope: "personal" | "platform" = "personal";
  let audioFile: File | null = null;

  try {
    if (contentType.includes("multipart/form-data")) {
      const fd = await req.formData();
      title = String(fd.get("title") ?? "").trim();
      genre = VALID_GENRES.includes(String(fd.get("genre") ?? ""))
        ? String(fd.get("genre"))
        : "Other";
      bpm = Math.min(Math.max(Math.floor(Number(fd.get("bpm") ?? 120)), 60), 220);
      key = String(fd.get("key") ?? "").trim() || null;
      const tagsRaw = String(fd.get("tags") ?? "");
      tags = tagsRaw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      broadcastTag = String(fd.get("broadcastTag") ?? fd.get("producerName") ?? "").trim();
      previewUrl = String(fd.get("previewUrl") ?? "").trim();
      basicPrice = Math.floor(Number(fd.get("basicPrice") ?? DEFAULT_LICENSE_PRICES.non_exclusive));
      listForSale =
        fd.get("listForSale") === "true" ||
        fd.get("listForSale") === "1" ||
        Boolean(fd.get("basicPrice"));
      stashScope = fd.get("stashScope") === "platform" ? "platform" : "personal";
      const f = fd.get("file");
      if (f instanceof File && f.size > 0) audioFile = f;
    } else {
      const body = (await req.json()) as Record<string, unknown>;
      title = typeof body.title === "string" ? body.title.trim() : "";
      genre = VALID_GENRES.includes(body.genre as string) ? (body.genre as string) : "Other";
      bpm = Math.min(Math.max(Math.floor(Number(body.bpm ?? 120)), 60), 220);
      key = typeof body.key === "string" ? body.key.trim() || null : null;
      tags = Array.isArray(body.tags)
        ? (body.tags as string[]).map(String)
        : typeof body.tags === "string"
          ? body.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [];
      broadcastTag =
        (typeof body.broadcastTag === "string" && body.broadcastTag.trim()) ||
        (typeof body.producerName === "string" && body.producerName.trim()) ||
        "";
      previewUrl = typeof body.previewUrl === "string" ? body.previewUrl.trim() : "";
      if (body.basicPrice != null) {
        basicPrice = Math.floor(Number(body.basicPrice));
        listForSale = true;
      }
      if (body.listForSale === true) listForSale = true;
      stashScope = body.stashScope === "platform" ? "platform" : "personal";
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json({ ok: false, error: "Beat name is required." }, { status: 400 });
  }
  if (!broadcastTag) {
    return NextResponse.json(
      { ok: false, error: "Broadcast tag (seller display name on air) is required." },
      { status: 400 },
    );
  }
  if (listForSale && (!Number.isFinite(basicPrice) || basicPrice < 99)) {
    return NextResponse.json(
      { ok: false, error: "Marketplace path requires a price of at least $0.99 (99¢)." },
      { status: 400 },
    );
  }

  if (audioFile) {
    const ext = getExt(audioFile.name);
    if (!ALLOWED_EXT.has(ext)) {
      return NextResponse.json(
        { ok: false, error: `Unsupported audio type (${ext || "none"}). Use mp3/wav/flac/aiff.` },
        { status: 400 },
      );
    }
    const stored = await persistUploadedMediaFile({
      file: audioFile,
      ownerId: auth.user.id,
      fallbackExt: ext.replace(".", "") || "mp3",
    });
    if (!stored.ok) {
      return NextResponse.json({ ok: false, error: stored.error }, { status: stored.status });
    }
    previewUrl = stored.url;
  }

  if (!isDurablePlayableMediaUrl(previewUrl)) {
    return NextResponse.json(
      { ok: false, error: "Add an audio file or a refresh-safe preview URL (not a local blob: link)." },
      { status: 400 },
    );
  }

  const scopeTag = stashScope === "platform" ? "platform-catalog" : "personal-stash";
  const marketTag = listForSale ? "marketplace-listed" : "competition-only";
  const mergedTags = [
    ...new Set([...tags, scopeTag, marketTag, `broadcast:${broadcastTag}`]),
  ];
  const slug = `beat-locker-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  try {
    const beat = await prisma.beat.create({
      data: {
        producerId: auth.user.id,
        slug,
        title,
        genre,
        bpm,
        key,
        tags: mergedTags,
        previewUrl,
        taggedUrl: previewUrl,
        basicPrice: listForSale ? basicPrice : DEFAULT_LICENSE_PRICES.non_exclusive,
        premiumPrice: DEFAULT_LICENSE_PRICES.stems,
        exclusivePrice: DEFAULT_LICENSE_PRICES.exclusive,
        producerName: broadcastTag,
        status: listForSale ? "published" : "draft",
        moderationStatus: listForSale ? "APPROVED" : "PENDING",
        adminSubmitted: false,
      },
    });

    await prisma.song.create({
      data: {
        uploaderId: auth.user.id,
        title,
        audioUrl: previewUrl,
        genre,
        bpm,
        key,
        status: "ACTIVE",
      },
    }).catch((songErr) => {
      console.error("[locker-submit] song bind failed", songErr);
    });

    let inventoryNote: string | undefined;
    if (listForSale) {
      const inv = buildBeatDropInventory(beat.id, {
        non_exclusive: beat.basicPrice,
        exclusive: beat.exclusivePrice ?? DEFAULT_LICENSE_PRICES.exclusive,
        stems: beat.premiumPrice,
        unlimited: DEFAULT_LICENSE_PRICES.unlimited,
      });
      inventoryNote = inv.hasAvailability
        ? `Marketplace inventory ready at $${(beat.basicPrice / 100).toFixed(2)}.`
        : "Marketplace inventory unavailable.";
    }

    return NextResponse.json(
      {
        ok: true,
        beat: {
          id: beat.id,
          title: beat.title,
          genre: beat.genre,
          bpm: beat.bpm,
          key: beat.key,
          tags: beat.tags,
          producerId: beat.producerId,
          producerName: beat.producerName,
          broadcastTag: beat.producerName,
          status: beat.status,
          moderationStatus: beat.moderationStatus,
          basicPrice: beat.basicPrice,
          premiumPrice: beat.premiumPrice,
          exclusivePrice: beat.exclusivePrice,
          previewUrl: beat.previewUrl,
          createdAt: beat.createdAt.toISOString(),
        },
        inventoryNote,
      },
      { status: 201 },
    );
  } catch (error) {
    // Diagnostic guard only — surfaces the real failure in server logs instead
    // of an opaque, message-less crash. Never send raw Prisma/SQL details to
    // the client. Root cause still needs to be captured before any behavioral
    // fix (slug, auth, storage) is authorized.
    console.error("[beat-locker-submit] prisma.beat.create failed", error);
    return NextResponse.json(
      { ok: false, error: "beat_create_failed" },
      { status: 500 },
    );
  }
}
