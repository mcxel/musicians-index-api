import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { checkRateLimit } from '@/lib/security/TMISecurityEngine';
import prisma from '@/lib/prisma';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';
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

  const auth = await getTmiAuth();
  if (!auth) {
    recordMediaObservabilityEvent('upload_failed', { mediaType: 'media', reason: 'unauthorized' });
    return NextResponse.json({ error: 'Log in to upload media.' }, { status: 401 });
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

  const dbUser = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: { id: true },
  }).catch(() => null);

  // If auth fell back to session hex (no email), resolve via email cookie once more
  let uploaderId = dbUser?.id ?? null;
  if (!uploaderId && auth.user.email) {
    const byEmail = await prisma.user.findUnique({
      where: { email: auth.user.email },
      select: { id: true },
    }).catch(() => null);
    uploaderId = byEmail?.id ?? null;
  }

  if (!uploaderId) {
    recordMediaObservabilityEvent('upload_failed', { mediaType: 'media', reason: 'owner_unresolved' });
    return NextResponse.json(
      { error: 'Could not bind upload to your account. Re-login and try again.' },
      { status: 401 },
    );
  }

  const isAudio = ALLOWED_AUDIO.includes(file.type);
  const isVideo = ALLOWED_VIDEO.includes(file.type);
  const title = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

  async function persistToDB(url: string): Promise<{ id: string; type: 'songs' | 'videos' }> {
    if (isVideo) {
      const row = await prisma.video.create({
        data: { uploaderId: uploaderId!, title, videoUrl: url, status: 'ACTIVE' },
        select: { id: true },
      });
      return { id: row.id, type: 'videos' };
    }
    const row = await prisma.song.create({
      data: { uploaderId: uploaderId!, title, audioUrl: url, status: 'ACTIVE' },
      select: { id: true },
    });
    return { id: row.id, type: 'songs' };
  }

  try {
    let url: string;
    let storage: 'blob' | 'local_disk';

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { put } = await import('@vercel/blob');
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const pathname = `tmi-media/${uploaderId}/${Date.now()}-${safeName}`;
      const blob = await put(pathname, file, { access: 'public' });
      url = blob.url;
      storage = 'blob';
    } else {
      // Soft-launch fallback when Vercel Blob is not configured.
      //
      // In LOCAL dev: write to /tmp (Vercel-compatible writable dir) and
      // serve via the /api/upload/media/local/[fileName] route.
      //
      // In PRODUCTION (Vercel) without Blob: the project filesystem is
      // read-only so we convert to a base64 data URL and store it directly
      // in the DB's audioUrl/videoUrl column.  This keeps uploads working at
      // soft-launch scale without requiring Blob setup first.  Large files
      // (>10 MB) are rejected with a clear message — those must use Blob.
      const bytes = Buffer.from(await file.arrayBuffer());
      const isLocalDev = process.env.NODE_ENV !== 'production';

      if (isLocalDev) {
        const ext = file.name.split('.').pop()?.toLowerCase() ?? (isVideo ? 'mp4' : 'mp3');
        const safeBase = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '_') || 'upload';
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeBase}.${ext}`;
        const uploadDir = '/tmp/tmi-uploads';
        const absolutePath = path.join(uploadDir, fileName);
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(absolutePath, bytes);
        url = `/api/upload/media/local/${encodeURIComponent(fileName)}`;
      } else {
        // Production without Blob: store as base64 data URL.
        // Cap at 10 MB encoded to avoid oversized DB rows.
        if (bytes.length > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'File storage is not fully configured yet. Files larger than 10 MB cannot be uploaded right now. Please contact support or try a smaller file.' },
            { status: 503 },
          );
        }
        url = `data:${file.type};base64,${bytes.toString('base64')}`;
      }
      storage = 'local_disk';
    }

    const persisted = await persistToDB(url);
    recordMediaObservabilityEvent(isVideo ? 'video_upload_success' : 'song_upload_success', {
      storage,
      mimeType: file.type,
      assetId: persisted.id,
      ownerUserId: uploaderId,
    });

    return NextResponse.json({
      ok: true,
      url,
      id: persisted.id,
      type: persisted.type,
      title,
      isAudio,
      isVideo,
      ...(storage === 'local_disk' ? { _local: true } : {}),
    });
  } catch (err) {
    console.error('[upload/media] persist failed', err);
    recordMediaObservabilityEvent('upload_failed', { mediaType: 'media', reason: 'persist_failed' });
    return NextResponse.json(
      { error: 'Upload stored but failed to bind to Media Locker. Retry or contact support.' },
      { status: 500 },
    );
  }
}
