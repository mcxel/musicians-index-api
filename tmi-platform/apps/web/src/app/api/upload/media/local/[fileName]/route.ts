import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';
import path from 'node:path';

function mimeForExt(ext: string): string {
  const normalized = ext.toLowerCase();
  if (normalized === 'mp3') return 'audio/mpeg';
  if (normalized === 'wav') return 'audio/wav';
  if (normalized === 'ogg') return 'audio/ogg';
  if (normalized === 'm4a') return 'audio/mp4';
  if (normalized === 'aac') return 'audio/aac';
  if (normalized === 'flac') return 'audio/flac';
  if (normalized === 'webm') return 'video/webm';
  if (normalized === 'mp4') return 'video/mp4';
  if (normalized === 'mov') return 'video/quicktime';
  if (normalized === 'avi') return 'video/x-msvideo';
  return 'application/octet-stream';
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { fileName: string } },
) {
  const raw = params.fileName;
  const decoded = decodeURIComponent(raw);
  const safeName = path.basename(decoded);
  if (!safeName || safeName !== decoded) {
    return NextResponse.json({ error: 'Invalid file path.' }, { status: 400 });
  }

  const absolutePath = path.join(process.cwd(), '.tmi-data', 'uploads', 'media', safeName);

  try {
    const content = await fs.readFile(absolutePath);
    const ext = path.extname(safeName).slice(1);
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': mimeForExt(ext),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Media file not found.' }, { status: 404 });
  }
}
