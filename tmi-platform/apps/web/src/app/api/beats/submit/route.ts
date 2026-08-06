export const dynamic = "force-dynamic";

/**
 * POST /api/beats/submit
 *
 * Beat Submission API — Living OS Beat Ecosystem Phase 1.
 *
 * Accepts multipart/form-data:
 *   audio                    File     (required) mp3 | wav | aiff | flac, max 100 MB
 *   displayName              string   (required) unique among LIVE beats
 *   genreJson                string   (required) JSON array of BeatGenre values
 *   moodJson                 string   (optional) JSON array of mood strings
 *   energyLevel              string   (optional)
 *   estimatedBpm             string   (optional) integer
 *   musicalKey               string   (optional)
 *   eligiblePoolsJson        string   (optional) JSON array of BeatPlacementPool values
 *   competitionEligible      string   (optional) "true" | "false"
 *   licenseType              string   (optional) STANDARD | LIMITED | COMMERCIAL | EXCLUSIVE | LIVE_AUCTION
 *   royaltySplitsJson        string   (required) JSON array of { recipientName, accountId?, percentage, role }
 *   rightsDeclarationAccepted string  (required) must be "true"
 *   batchIngestSession       string   (optional) batch_XXXXXXXX token
 *
 * Returns:
 *   201 { success, canonicalId, beatDbId, status, message }
 *   400 { error, details? }
 *   401 { error: "authentication_required" }
 *   403 { error: "role_required", requiredRole: "BEAT_CREATOR" }
 */

import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { createHash, randomBytes } from "crypto";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import prisma from "@/lib/prisma";

const ALLOWED_MIME_TYPES = new Set([
  "audio/mpeg", "audio/mp3", "audio/wav", "audio/wave",
  "audio/x-wav", "audio/aiff", "audio/x-aiff", "audio/flac", "audio/x-flac",
]);
const ALLOWED_EXTENSIONS = new Set([".mp3", ".wav", ".aiff", ".aif", ".flac"]);
const MAX_FILE_BYTES = 100 * 1024 * 1024; // 100 MB

function generateBeatCanonicalId(): string {
  return "B-" + randomBytes(4).toString("hex").toUpperCase();
}
function hashAudioBuffer(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}
function getExt(filename: string): string {
  const i = filename.lastIndexOf(".");
  return i === -1 ? "" : filename.slice(i).toLowerCase();
}

export async function POST(req: Request) {
  // 1. Auth
  const auth = await getTmiAuth();
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  const role = (auth.user.role ?? "").toLowerCase();
  if (role !== "beat_creator" && role !== "admin") {
    return NextResponse.json({ error: "role_required", requiredRole: "BEAT_CREATOR" }, { status: 403 });
  }

  // 2. Parse form
  let fd: FormData;
  try { fd = await req.formData(); }
  catch { return NextResponse.json({ error: "invalid_form_data" }, { status: 400 }); }

  const audioFile = fd.get("audio");
  if (!(audioFile instanceof File)) return NextResponse.json({ error: "audio_required" }, { status: 400 });
  const displayName = (fd.get("displayName") as string | null)?.trim();
  if (!displayName) return NextResponse.json({ error: "display_name_required" }, { status: 400 });
  const genreRaw = fd.get("genreJson") as string | null;
  if (!genreRaw) return NextResponse.json({ error: "genre_required" }, { status: 400 });
  if (fd.get("rightsDeclarationAccepted") !== "true") {
    return NextResponse.json({ error: "rights_declaration_required" }, { status: 400 });
  }
  const splitsRaw = fd.get("royaltySplitsJson") as string | null;
  if (!splitsRaw) return NextResponse.json({ error: "royalty_splits_required" }, { status: 400 });

  // 3. Validate file
  const ext = getExt(audioFile.name);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json({ error: "unsupported_file_type", details: `Accepted: MP3 WAV AIFF FLAC. Got: ${ext || "(none)"}` }, { status: 400 });
  }
  if (audioFile.type && !ALLOWED_MIME_TYPES.has(audioFile.type)) {
    return NextResponse.json({ error: "unsupported_mime_type", details: audioFile.type }, { status: 400 });
  }
  if (audioFile.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "file_too_large", details: `Max 100 MB. Got ${(audioFile.size / 1048576).toFixed(1)} MB` }, { status: 400 });
  }
  if (audioFile.size === 0) return NextResponse.json({ error: "empty_file" }, { status: 400 });

  // 4. Validate JSON
  let genres: string[];
  try {
    genres = JSON.parse(genreRaw);
    if (!Array.isArray(genres) || genres.length === 0) throw new Error();
  } catch { return NextResponse.json({ error: "invalid_genre_json" }, { status: 400 }); }

  type RoyaltySplitInput = { recipientName: string; accountId?: string; percentage: number; role: string };
  let splits: RoyaltySplitInput[];
  try {
    splits = JSON.parse(splitsRaw);
    if (!Array.isArray(splits) || splits.length === 0) throw new Error();
    const total = splits.reduce((s, r) => s + (r.percentage ?? 0), 0);
    if (Math.abs(total - 100) > 0.01) {
      return NextResponse.json({ error: "royalty_splits_must_sum_to_100", details: `Total: ${total.toFixed(2)}%` }, { status: 400 });
    }
  } catch (e) {
    if (e instanceof NextResponse) return e as never;
    return NextResponse.json({ error: "invalid_royalty_splits_json" }, { status: 400 });
  }

  const moodRaw   = (fd.get("moodJson") as string | null) ?? "[]";
  const poolsRaw  = (fd.get("eligiblePoolsJson") as string | null) ?? "[]";
  const license   = (fd.get("licenseType") as string | null) ?? "STANDARD";
  const energy    = (fd.get("energyLevel") as string | null) ?? null;
  const bpmStr    = fd.get("estimatedBpm") as string | null;
  const bpm       = bpmStr ? parseInt(bpmStr, 10) : null;
  const key       = (fd.get("musicalKey") as string | null) ?? null;
  const compElig  = fd.get("competitionEligible") === "true";
  const batchSess = (fd.get("batchIngestSession") as string | null) ?? null;

  // 5. Name uniqueness (only blocks active beats; retired titles can be reused)
  const nameConflict = await prisma.beat.findFirst({
    where: { title: { equals: displayName, mode: "insensitive" }, status: { in: ["LIVE", "FEATURED", "APPROVED", "SANDBOX"] } },
    select: { canonicalId: true },
  });
  if (nameConflict) {
    return NextResponse.json({
      error: "display_name_conflict",
      details: `"${displayName}" is active as ${nameConflict.canonicalId ?? "(legacy)"}. Choose a different title.`,
    }, { status: 409 });
  }

  // 6. Hash for duplicate detection
  const buf = Buffer.from(await audioFile.arrayBuffer());
  const hash = hashAudioBuffer(buf);
  const dup = await prisma.beat.findFirst({
    where: { audioFileHash: hash, status: { not: "RETIRED" } },
    select: { canonicalId: true, status: true },
  });
  if (dup) {
    return NextResponse.json({
      error: "duplicate_audio_file",
      details: `File already exists as ${dup.canonicalId ?? "(legacy)"} (${dup.status}).`,
    }, { status: 409 });
  }

  // 7. Upload to Vercel Blob
  const canonicalId = generateBeatCanonicalId();
  let audioAssetUrl: string;
  try {
    const blob = await put(`beats/${auth.user.id}/${canonicalId}${ext}`, buf, {
      access: "public",
      contentType: audioFile.type || "audio/mpeg",
      addRandomSuffix: false,
    });
    audioAssetUrl = blob.url;
  } catch (err) {
    console.error("[beat/submit] blob upload failed:", err);
    return NextResponse.json({ error: "upload_failed", details: "Storage unavailable. Retry." }, { status: 502 });
  }

  // 8. Persist
  try {
    const beat = await prisma.beat.create({
      data: {
        canonicalId,
        title: displayName,
        producerId: auth.user.id,
        producerName: auth.user.name,
        audioAssetUrl,
        audioFilename: audioFile.name,
        audioFileHash: hash,
        audioFileSizeBytes: audioFile.size,
        status: "PENDING_CERTIFICATION",
        genreJson: JSON.stringify(genres),
        genre: genres[0] ?? "Other",
        moodJson: moodRaw,
        energyLevel: energy,
        eligiblePoolsJson: poolsRaw,
        competitionEligible: compElig,
        licenseType: license,
        batchIngestSession: batchSess,
        rightsDeclarationAccepted: true,
        submittedAt: new Date(),
        // Legacy required fields
        slug: `${canonicalId.toLowerCase()}-${Date.now()}`,
        bpm: (bpm !== null && !isNaN(bpm)) ? bpm : 120,
        key,
        tags: [],
        previewUrl: audioAssetUrl,
        taggedUrl: audioAssetUrl,
        basicPrice: 2999,
        premiumPrice: 7999,
        moderationStatus: "PENDING",
        adminSubmitted: false,
        royaltySplits: {
          create: splits.map((s) => ({
            recipientName: s.recipientName,
            accountId: s.accountId ?? null,
            percentage: s.percentage,
            role: s.role,
          })),
        },
        provenanceEvents: {
          create: {
            eventType: "BEAT_SUBMITTED",
            actorId: auth.user.id,
            contextJson: JSON.stringify({
              notes: `Submitted by ${auth.user.name} (${auth.user.email})`,
              filename: audioFile.name,
              ...(batchSess ? { batchIngestSession: batchSess } : {}),
            }),
          },
        },
      },
      select: { id: true, canonicalId: true, status: true, title: true },
    });
    return NextResponse.json({
      success: true,
      canonicalId: beat.canonicalId,
      beatDbId: beat.id,
      status: beat.status,
      message: `"${beat.title}" received — ${beat.canonicalId}. Certification queued.`,
    }, { status: 201 });
  } catch (err) {
    console.error("[beat/submit] db write failed:", err);
    return NextResponse.json({ error: "database_error", details: "Could not save beat. Please retry." }, { status: 500 });
  }
}

