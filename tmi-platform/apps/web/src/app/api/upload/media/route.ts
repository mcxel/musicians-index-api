import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/TMISecurityEngine';
import prisma from '@/lib/prisma';
import { getTmiAuth } from '@/lib/auth/getTmiAuth';
import { recordMediaObservabilityEvent } from '@/lib/media/media-observability-store';
import { persistUploadedMediaFile, persistVerifiedBlobPathname } from '@/lib/media/persistUploadedMedia';
import { isDurablePlayableMediaUrl } from '@/lib/media/durablePlayableUrl';
import { isSafeBlobPathname, pathnameOwnedByUser } from '@/lib/media/blobStorage';

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

  const contentType = req.headers.get('content-type') ?? '';
  let uploadedFile: File | null = null;
  let blobPathname: string | null = null;
  let jsonTitle = '';
  let jsonIsVideo = false;

  if (contentType.includes('application/json')) {
    let body: Record<string, unknown>;
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      recordMediaObservabilityEvent('upload_failed', { mediaType: 'media', reason: 'invalid_json' });
      return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
    }
    const path = typeof body.blobPathname === 'string' ? body.blobPathname : '';
    if (!isSafeBlobPathname(path)) {
      recordMediaObservabilityEvent('upload_failed', { mediaType: 'media', reason: 'invalid_blob_path' });
      return NextResponse.json({ error: 'Invalid storage path.' }, { status: 400 });
    }
    blobPathname = path;
    jsonTitle = typeof body.title === 'string' ? body.title : '';
    jsonIsVideo = body.isVideo === true || body.type === 'video' || String(body.type ?? '').toLowerCase() === 'video';
  } else {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      recordMediaObservabilityEvent('upload_failed', { mediaType: 'media', reason: 'invalid_form_data' });
      return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 });
    }
    const file = formData.get('file');
    uploadedFile = file instanceof File && file.size > 0 ? file : null;
    if (!uploadedFile) {
      recordMediaObservabilityEvent('upload_failed', { mediaType: 'media', reason: 'missing_file' });
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }
  }

  if (uploadedFile) {
    const allowed_types = [...ALLOWED_AUDIO, ...ALLOWED_VIDEO];
    if (!allowed_types.includes(uploadedFile.type)) {
      recordMediaObservabilityEvent('upload_failed', { mediaType: 'media', reason: 'unsupported_type', fileType: uploadedFile.type });
      return NextResponse.json(
        { error: `Unsupported file type "${uploadedFile.type}". Upload MP3, WAV, OGG, M4A, MP4, or WebM files.` },
        { status: 415 },
      );
    }
    if (uploadedFile.size > MAX_BYTES) {
      recordMediaObservabilityEvent('upload_failed', { mediaType: 'media', reason: 'file_too_large', bytes: uploadedFile.size });
      return NextResponse.json(
        { error: `File too large (${Math.round(uploadedFile.size / 1024 / 1024)}MB). Maximum is 100MB.` },
        { status: 413 },
      );
    }
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: { id: true },
  }).catch(() => null);

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

  if (blobPathname && !pathnameOwnedByUser(blobPathname, uploaderId, auth.user.email)) {
    recordMediaObservabilityEvent('upload_failed', { mediaType: 'media', reason: 'blob_path_not_owned' });
    return NextResponse.json({ error: 'Storage path is not owned by this account.' }, { status: 403 });
  }

  const isVideo = uploadedFile
    ? ALLOWED_VIDEO.includes(uploadedFile.type)
    : jsonIsVideo || Boolean(blobPathname?.match(/\.(mp4|webm|mov|avi)$/i));
  const isAudio = !isVideo;
  const title = jsonTitle.trim()
    || (uploadedFile ? uploadedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') : 'Untitled');

  async function persistToDB(url: string): Promise<{ id: string; type: 'songs' | 'videos' }> {
    if (isVideo) {
      const existing = await prisma.video.findFirst({
        where: { uploaderId: uploaderId!, videoUrl: url },
        select: { id: true },
      });
      if (existing) return { id: existing.id, type: 'videos' };
      const row = await prisma.video.create({
        data: { uploaderId: uploaderId!, title, videoUrl: url, status: 'ACTIVE' },
        select: { id: true },
      });
      return { id: row.id, type: 'videos' };
    }
    const existing = await prisma.song.findFirst({
      where: { uploaderId: uploaderId!, audioUrl: url },
      select: { id: true },
    });
    if (existing) return { id: existing.id, type: 'songs' };
    const row = await prisma.song.create({
      data: { uploaderId: uploaderId!, title, audioUrl: url, status: 'ACTIVE' },
      select: { id: true },
    });
    return { id: row.id, type: 'songs' };
  }

  try {
    const stored = blobPathname
      ? await persistVerifiedBlobPathname(blobPathname)
      : await persistUploadedMediaFile({
          file: uploadedFile!,
          ownerId: uploaderId,
          fallbackExt: isVideo ? 'mp4' : 'mp3',
        });
    if (!stored.ok) {
      recordMediaObservabilityEvent('upload_failed', { mediaType: 'media', reason: 'storage_unavailable' });
      return NextResponse.json({ error: stored.error }, { status: stored.status });
    }
    if (!isDurablePlayableMediaUrl(stored.url)) {
      recordMediaObservabilityEvent('upload_failed', { mediaType: 'media', reason: 'unplayable_url' });
      return NextResponse.json({ error: 'Storage returned an unplayable URL. Nothing was saved.' }, { status: 503 });
    }

    const persisted = await persistToDB(stored.url);
    recordMediaObservabilityEvent(isVideo ? 'video_upload_success' : 'song_upload_success', {
      storage: stored.storage,
      mimeType: uploadedFile?.type ?? 'blob',
      assetId: persisted.id,
      ownerUserId: uploaderId,
    });

    return NextResponse.json({
      ok: true,
      url: stored.url,
      id: persisted.id,
      type: persisted.type,
      title,
      isAudio,
      isVideo,
      ...(stored.storage === 'local_disk' ? { _local: true } : {}),
    }, { status: 201 });
  } catch (err) {
    console.error('[upload/media] persist failed', err);
    recordMediaObservabilityEvent('upload_failed', { mediaType: 'media', reason: 'persist_failed' });
    return NextResponse.json(
      { error: 'Upload stored but failed to bind to Media Locker. Retry or contact support.' },
      { status: 500 },
    );
  }
}
