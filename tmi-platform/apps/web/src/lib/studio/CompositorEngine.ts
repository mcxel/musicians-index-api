import { loadedAssets, registerAsset, setHydrationStatus } from '@/lib/registry/RuntimeAssetRegistry';

export type CompositionMode = 'still' | 'motion' | 'story' | 'poster';
export type CompositionStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface CompositionRequest {
  ownerId: string;
  ownerName: string;
  ownerTier: string;
  backdropId: string;
  backdropName: string;
  mode: CompositionMode;
  accentColor: string;
  sourceImageUrl?: string | null;
  templateId?: string;
  title?: string;
  description?: string;
  sourceKind?: 'fan-retro-vision' | 'performer-motion' | 'magazine-cover' | 'memory-card';
}

export interface CompositionAsset {
  assetId: string;
  ownerId: string;
  ownerName: string;
  backdropId: string;
  backdropName: string;
  mode: CompositionMode;
  templateId: string;
  title: string;
  description: string;
  previewDataUrl: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export interface CompositionJob {
  jobId: string;
  status: CompositionStatus;
  request: CompositionRequest;
  createdAt: string;
  updatedAt: string;
  asset?: CompositionAsset;
  error?: string;
}

const jobs = new Map<string, CompositionJob>();

function sanitizeId(input: string, fallback: string): string {
  const cleaned = input.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
  return cleaned || fallback;
}

function escapeXml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildTimestampLabel(): string {
  return new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function toDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function buildPreviewSvg(request: CompositionRequest, assetId: string): string {
  const modeLabel = request.mode.toUpperCase();
  const title = escapeXml(request.title || `${request.ownerName} Retro-Vision`);
  const description = escapeXml(request.description || request.backdropName);
  const ownerName = escapeXml(request.ownerName);
  const backdropName = escapeXml(request.backdropName);
  const sourceHref = request.sourceImageUrl ? escapeXml(request.sourceImageUrl) : '';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
      <defs>
        <radialGradient id="glow" cx="50%" cy="18%" r="80%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.45" />
          <stop offset="45%" stop-color="#ffffff" stop-opacity="0.05" />
          <stop offset="100%" stop-color="#050510" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="scrim" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#050510" stop-opacity="0.06" />
          <stop offset="100%" stop-color="#050510" stop-opacity="0.82" />
        </linearGradient>
      </defs>
      <rect width="1200" height="1200" fill="#050510" />
      <rect width="1200" height="1200" fill="url(#glow)" />
      <rect width="1200" height="1200" fill="${request.accentColor}" fill-opacity="0.16" />
      <rect x="64" y="64" width="1072" height="1072" rx="44" fill="${request.accentColor}" fill-opacity="0.12" stroke="${request.accentColor}" stroke-opacity="0.45" stroke-width="3" />
      <rect x="88" y="88" width="1024" height="1024" rx="34" fill="#111827" fill-opacity="0.82" />
      <rect x="88" y="88" width="1024" height="1024" rx="34" fill="url(#scrim)" />
      ${sourceHref ? `<image href="${sourceHref}" x="220" y="190" width="760" height="640" preserveAspectRatio="xMidYMid slice" opacity="0.92" />` : `<rect x="220" y="190" width="760" height="640" rx="26" fill="#ffffff" fill-opacity="0.08" />`}
      <rect x="220" y="190" width="760" height="640" rx="26" fill="none" stroke="#ffffff" stroke-opacity="0.26" stroke-width="2" />
      <text x="110" y="150" fill="#ffffff" font-size="28" font-family="Arial, sans-serif" font-weight="700" letter-spacing="8">THE MUSICIAN'S INDEX</text>
      <text x="110" y="1010" fill="#ffffff" font-size="72" font-family="Arial, sans-serif" font-weight="900" letter-spacing="1">${title}</text>
      <text x="110" y="1062" fill="${request.accentColor}" font-size="30" font-family="Arial, sans-serif" font-weight="700" letter-spacing="2">${ownerName} · ${backdropName}</text>
      <text x="110" y="1110" fill="#e2e8f0" font-size="24" font-family="Arial, sans-serif" font-weight="600">${description}</text>
      <text x="890" y="150" fill="${request.accentColor}" font-size="24" font-family="Arial, sans-serif" font-weight="900" text-anchor="end">${modeLabel}</text>
      <text x="110" y="117" fill="#fcd34d" font-size="18" font-family="Arial, sans-serif" font-weight="800">ASSET ${escapeXml(assetId)}</text>
    </svg>`;
}

export function submitComposition(request: CompositionRequest): CompositionJob {
  const createdAt = new Date().toISOString();
  const jobId = `cmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const assetId = `asset-${sanitizeId(jobId, 'asset')}`;

  const job: CompositionJob = {
    jobId,
    status: 'processing',
    request,
    createdAt,
    updatedAt: createdAt,
  };

  jobs.set(jobId, job);

  try {
    const templateId = sanitizeId(request.templateId ?? request.backdropId, 'template');
    const previewSvg = buildPreviewSvg(request, assetId);
    const previewDataUrl = toDataUrl(previewSvg);
    const title = request.title || `${request.ownerName} Retro-Vision ${request.mode}`;
    const description = request.description || `${request.backdropName} backdrop · ${buildTimestampLabel()}`;

    const asset: CompositionAsset = {
      assetId,
      ownerId: request.ownerId,
      ownerName: request.ownerName,
      backdropId: request.backdropId,
      backdropName: request.backdropName,
      mode: request.mode,
      templateId,
      title,
      description,
      previewDataUrl,
      createdAt,
      metadata: {
        sourceKind: request.sourceKind ?? 'fan-retro-vision',
        accentColor: request.accentColor,
        ownerTier: request.ownerTier,
      },
    };

    loadedAssets.set(assetId, {
      assetId,
      type: 'UI',
      rebuildHistory: ['CompositorEngine'],
      sourceMetadata: {
        ownerId: request.ownerId,
        ownerName: request.ownerName,
        backdropId: request.backdropId,
        backdropName: request.backdropName,
        mode: request.mode,
        templateId,
      },
    });

    registerAsset(assetId, 'ui-card', request.ownerId, {
      generatorId: 'CompositorEngine',
      motionCompatible: request.mode !== 'still',
      metadata: asset.metadata,
      tags: ['composite', request.mode, request.backdropId, request.ownerId],
    });
    setHydrationStatus(assetId, 'hydrated');

    job.status = 'completed';
    job.asset = asset;
    job.updatedAt = new Date().toISOString();
    jobs.set(jobId, job);
    return job;
  } catch (error) {
    job.status = 'failed';
    job.error = error instanceof Error ? error.message : 'composition_failed';
    job.updatedAt = new Date().toISOString();
    jobs.set(jobId, job);
    return job;
  }
}

export function getCompositionJob(jobId: string): CompositionJob | null {
  return jobs.get(jobId) ?? null;
}

export function listCompositionJobs(ownerId?: string): CompositionJob[] {
  return Array.from(jobs.values())
    .filter((job) => !ownerId || job.request.ownerId === ownerId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
