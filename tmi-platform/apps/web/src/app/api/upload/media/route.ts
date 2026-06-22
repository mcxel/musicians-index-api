import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { checkRateLimit } from '@/lib/security/TMISecurityEngine';
import prisma from '@/lib/prisma';
import { recordMediaObservabilityEvent } from '@/lib/media/media-observability-store';

const ALLOWED_AUDIO = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac', 'audio/flac', 'audio/webm', 'audio/x-m4a'];
const ALLOWED_VIDEO = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/ogg'];
const MAX_BYTES = 100 * 1024 * 1024; // 100 MB

export async function POST(req: NextRequest) {
  const clientIp = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? '127.0.0.1';
  const { allowed } = checkRateLimit(`upload:media:${clientIp}`, 10, 60_000);
  if (!allowed) {
    recordMediaObservabilityEvent('upload_failed', { mediaType: 'media', reason: 'rate_limit' });
    return NextResponse.json({ error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    recordMediaObservabilityEvent('upload_failed', { mediaType: 'media', reason: 'invalid_form_data' });
    return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  if (!file) {
    recordMediaObservabilityEvent('upload_failed', { mediaType: 'media', reason: 'missing_file' });
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  const allowed_types = [...ALLOWED_AUDIO, ...ALLOWED_VIDEO];
  if (!allowed_types.includes(file.type)) {
    recordMediaObservabilityEvent('upload_failed', { mediaType: 'media', reason: 'unsupported_type', fileType: file.type });
    return NextResponse.json(
      { error: `Unsupported file type "${file.type}". Upload MP3, WAV, OGG, M4A, MP4, or WebM files.` },
      { status: 415 },
    );
  }

  if (file.size > MAX_BYTES) {
    recordMediaObservabilityEvent('upload_failed', { mediaType: 'media', reason: 'file_too_large', bytes: file.size });
    return NextResponse.json(
      { error: `File too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum is 100MB.` },
      { status: 413 },
    );
  }

  // Use Vercel Blob when token is present; fall back to a mock CDN URL
  const email = req.cookies.get('tmi_user_email')?.value;
  const dbUser = email
    ? await prisma.user.findUnique({ where: { email }, select: { id: true } }).catch(() => null)
    : null;

  const isAudio = ALLOWED_AUDIO.includes(file.type);
  const isVideo = ALLOWED_VIDEO.includes(file.type);
  const title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

  async function persistToDB(url: string) {
    if (!dbUser) return;
    try {
      if (isVideo) {
        await prisma.video.create({ data: { uploaderId: dbUser.id, title, videoUrl: url, status: 'ACTIVE' } });
      } else if (isAudio) {
        await prisma.song.create({ data: { uploaderId: dbUser.id, title, audioUrl: url, status: 'ACTIVE' } });
      }
    } catch { /* non-fatal */ }
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const pathname = `tmi-media/${Date.now()}-${safeName}`;
    const blob = await put(pathname, file, { access: 'public' });
    await persistToDB(blob.url);
    recordMediaObservabilityEvent(isVideo ? 'video_upload_success' : 'song_upload_success', { storage: 'blob', mimeType: file.type });
    return NextResponse.json({ url: blob.url, isAudio, isVideo });
  }

  // Local development fallback: persist file on disk and expose a first-party URL.
  const ext = file.name.split('.').pop()?.toLowerCase() ?? (isVideo ? 'mp4' : 'mp3');
  const safeBase = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '_') || 'upload';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeBase}.${ext}`;
  const uploadDir = path.join(process.cwd(), '.tmi-data', 'uploads', 'media');
  const absolutePath = path.join(uploadDir, fileName);
  const bytes = Buffer.from(await file.arrayBuffer());

  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(absolutePath, bytes);

  const localUrl = `/api/upload/media/local/${encodeURIComponent(fileName)}`;
  await persistToDB(localUrl);
  recordMediaObservabilityEvent(isVideo ? 'video_upload_success' : 'song_upload_success', { storage: 'local_disk', mimeType: file.type });
  return NextResponse.json({ url: localUrl, isAudio, isVideo, _local: true });
}
