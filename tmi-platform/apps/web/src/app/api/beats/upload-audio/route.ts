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

const ALLOWED_MIME_TYPES = new Set([
  "audio/mpeg", "audio/mp3", "audio/wav", "audio/wave",
  "audio/x-wav", "audio/aiff", "audio/x-aiff", "audio/flac", "audio/x-flac",
]);
const ALLOWED_EXTENSIONS = new Set([".mp3", ".wav", ".aiff", ".aif", ".flac"]);
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
    return NextResponse.json({ error: "unsupported_file_type", details: `Accepted: MP3 WAV AIFF FLAC. Got: ${ext || "(none)"}` }, { status: 400 });
  }
  if (audioFile.type && !ALLOWED_MIME_TYPES.has(audioFile.type)) {
    return NextResponse.json({ error: "unsupported_mime_type", details: audioFile.type }, { status: 400 });
  }
  if (audioFile.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "file_too_large", details: `Max 100 MB. Got ${(audioFile.size / 1048576).toFixed(1)} MB` }, { status: 400 });
  }
  if (audioFile.size === 0) return NextResponse.json({ error: "empty_file" }, { status: 400 });

  const buf = Buffer.from(await audioFile.arrayBuffer());
  const fileName = `beats/${auth.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;

  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import("@vercel/blob");
      const blob = await put(fileName, buf, {
        access: "public",
        contentType: audioFile.type || "audio/mpeg",
        addRandomSuffix: false,
      });
      return NextResponse.json({ success: true, url: blob.url }, { status: 201 });
    }

    // Dev fallback without Blob storage configured — data URL so local
    // testing still works. Not viable for real-size audio in production,
    // which is exactly why the BLOB_READ_WRITE_TOKEN path above is used
    // whenever it's configured.
    const dataUrl = `data:${audioFile.type || "audio/mpeg"};base64,${buf.toString("base64")}`;
    return NextResponse.json({ success: true, url: dataUrl }, { status: 201 });
  } catch (err) {
    console.error("[beats/upload-audio] upload failed:", err);
    return NextResponse.json({ error: "upload_failed", details: "Storage unavailable. Retry." }, { status: 502 });
  }
}
