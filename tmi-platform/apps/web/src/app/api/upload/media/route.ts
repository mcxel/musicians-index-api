import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/TMISecurityEngine';

const ALLOWED_AUDIO = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a', 'audio/aac', 'audio/flac', 'audio/webm', 'audio/x-m4a'];
const ALLOWED_VIDEO = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/ogg'];
const MAX_BYTES = 100 * 1024 * 1024; // 100 MB

export async function POST(req: NextRequest) {
  const clientIp = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? '127.0.0.1';
  const { allowed } = checkRateLimit(`upload:media:${clientIp}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded. Please wait a moment.' }, { status: 429 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 });
  }

  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  const allowed_types = [...ALLOWED_AUDIO, ...ALLOWED_VIDEO];
  if (!allowed_types.includes(file.type)) {
    return NextResponse.json(
      { error: `Unsupported file type "${file.type}". Upload MP3, WAV, OGG, M4A, MP4, or WebM files.` },
      { status: 415 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum is 100MB.` },
      { status: 413 },
    );
  }

  // Use Vercel Blob when token is present; fall back to a mock CDN URL
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import('@vercel/blob');
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const pathname = `tmi-media/${Date.now()}-${safeName}`;
    const blob = await put(pathname, file, { access: 'public' });
    return NextResponse.json({
      url: blob.url,
      isAudio: ALLOWED_AUDIO.includes(file.type),
      isVideo: ALLOWED_VIDEO.includes(file.type),
    });
  }

  // Fallback: return a placeholder URL so UI doesn't break during dev
  const ext = file.name.split('.').pop() ?? 'mp3';
  const mockUrl = `https://cdn.themusiciansindex.com/media/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  return NextResponse.json({
    url: mockUrl,
    isAudio: ALLOWED_AUDIO.includes(file.type),
    isVideo: ALLOWED_VIDEO.includes(file.type),
    _mock: true,
  });
}
