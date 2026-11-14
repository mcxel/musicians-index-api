export const dynamic = "force-dynamic";

/**
 * POST /api/beats/upload-audio
 *
 * Minimal audio-file → hosted URL helper for admin/producer beat submission
 * forms that need a real previewUrl but only ever offered a paste-a-URL text
 * field (BJM report, 2026-08-04: "the beat does not have a save option" —
 * there was no way to turn a local audio file into the URL those forms
 * require). Does not create a Beat record — callers still POST the returned
 * url into /api/beats/submit or /api/beats/admin-submit themselves.
 */

import { NextRequest, NextResponse } from "next/server";
import { getTmiAuth } from "@/lib/auth/getTmiAuth";
import { checkRateLimit } from "@/lib/security/TMISecurityEngine";
import { persistUploadedMediaFile } from "@/lib/media/persistUploadedMedia";
import { isOrigamiAllowedAudio, planOrigamiDerivatives, registerCanonicalAudioSource, probeOrigamiTranscodeBackend } from "@/lib/beats/OrigamiAudioFabric";
import { validateIngestFile } from "@/lib/media/SecureMediaIngestGate";

const ALLOWED_MIME_TYPES = new Set([
  "audio/mpeg", "audio/mp3", "audio/wav", "audio/wave", "audio/x-wav",
]);
const ALLOWED_EXTENSIONS = new Set([".mp3", ".wav"]);
const MAX_FILE_BYTES = 100 * 1024 * 1024; // 100 MB

function getExt(filename: string): string {
  const i = filename.lastIndexOf(".");
  return i === -1 ? "" : filename.slice(i).toLowerCase();
}

export async function POST(req: NextRequest) {
  const auth = await getTmiAuth();
  if (!auth) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = checkRateLimit(`beats:upload-audio:${ip}`, 20, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let fd: FormData;
  try { fd = await req.formData(); }
  catch { return NextResponse.json({ error: "invalid_form_data" }, { status: 400 }); }

  const audioFile = fd.get("audio");
  if (!(audioFile instanceof File)) {
    return NextResponse.json({ error: "audio_required" }, { status: 400 });
  }

  const ext = getExt(audioFile.name);
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json({ error: "unsupported_file_type", details: `Accepted: MP3 WAV. Got: ${ext || "(none)"}` }, { status: 400 });
  }
  if (audioFile.type && !ALLOWED_MIME_TYPES.has(audioFile.type)) {
    return NextResponse.json({ error: "unsupported_mime_type", details: audioFile.type }, { status: 400 });
  }
  if (audioFile.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "file_too_large", details: `Max 100 MB. Got ${(audioFile.size / 1048576).toFixed(1)} MB` }, { status: 400 });
  }
  if (audioFile.size === 0) return NextResponse.json({ error: "empty_file" }, { status: 400 });

  const headerBytes = new Uint8Array(await audioFile.slice(0, 64).arrayBuffer());
  const gate = validateIngestFile({
    filename: audioFile.name,
    mime: audioFile.type || undefined,
    sizeBytes: audioFile.size,
    kind: "AUDIO",
    maxBytes: MAX_FILE_BYTES,
    headerBytes,
  });
  if (!gate.ok) {
    return NextResponse.json({ error: "security_rejected", details: gate.reason, stage: gate.stage }, { status: 400 });
  }
  const origamiAllow = isOrigamiAllowedAudio(audioFile.name, audioFile.type || undefined);
  if (!origamiAllow.ok) {
    return NextResponse.json({ error: "unsupported_file_type", details: origamiAllow.reason }, { status: 400 });
  }

  try {
    const stored = await persistUploadedMediaFile({
      file: audioFile,
      ownerId: auth.user.id,
      fallbackExt: ext.replace(".", "") || "mp3",
    });
    if (!stored.ok) {
      return NextResponse.json({ error: "upload_failed", details: stored.error }, { status: stored.status });
    }
    const identity = registerCanonicalAudioSource({
      ownerId: auth.user.id,
      filename: audioFile.name,
      sourceBytes: audioFile.size,
      sourceFormat: ext.replace(".", ""),
      contentBytes: headerBytes,
      ingestProvenance: "beats_upload_audio",
    });
    const origami = planOrigamiDerivatives({
      mediaAssetId: identity.mediaAssetId,
      submissionId: `sub_${Date.now().toString(36)}`,
      sourceBytes: audioFile.size,
      sourceExt: ext === ".wav" ? ".wav" : ".mp3",
    });
    const transcode = probeOrigamiTranscodeBackend();
    return NextResponse.json({
      success: true,
      url: stored.url,
      origami: {
        mediaAssetId: identity.mediaAssetId,
        stage: origami.stage,
        metrics: origami.metrics,
        profiles: origami.plan?.profiles ?? [],
        transcodeBackend: transcode.status,
        rightsStatus: identity.asset.rightsStatus,
        note: "Raw upload is ingestion source only — runtime uses Origami derivatives. TRANSCODE_BACKEND_UNBOUND unless a real encoder is bound.",
      },
    }, { status: 201 });
  } catch (err) {
    console.error("[beats/upload-audio] upload failed:", err);
    return NextResponse.json({ error: "upload_failed", details: "Storage unavailable. Retry." }, { status: 502 });
  }
}
