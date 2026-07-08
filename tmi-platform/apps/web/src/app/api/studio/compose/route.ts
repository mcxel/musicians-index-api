import { NextRequest, NextResponse } from 'next/server';
import { getCompositionJob, listCompositionJobs, submitComposition, type CompositionMode } from '@/lib/studio/CompositorEngine';
import {
  getCreativeCollection,
  listCreativeCollections,
  renderCreativeCollection,
} from '@/lib/studio/CreativeEngine';
import {
  resolveCreativePlan,
  type CreativeOutput,
  type CreativeRecipe,
  type StudioIntent,
} from '@/lib/studio/CreativeRecipeRegistry';

const VALID_MODES = new Set<CompositionMode>(['still', 'motion', 'story', 'poster']);
const VALID_RECIPES = new Set<CreativeRecipe>([
  'retro-vision-portrait',
  'magazine-cover',
  'concert-memory-pack',
  'story-card',
  'motion-poster',
]);
const VALID_OUTPUTS = new Set<CreativeOutput>(['feed-square', 'story-vertical', 'landscape-banner', 'poster-print']);
const VALID_INTENTS = new Set<StudioIntent>([
  'fan-retro-keepsake',
  'performer-poster',
  'magazine-cover-pack',
  'event-ticket-pack',
  'billboard-pack',
]);

function clean(input: unknown, fallback: string): string {
  if (typeof input !== 'string') return fallback;
  const cleaned = input.trim().replace(/[^a-zA-Z0-9 _-]/g, '').slice(0, 120);
  return cleaned || fallback;
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const ownerId = clean(body.ownerId, 'fan');
  const ownerName = clean(body.ownerName, 'Fan');
  const ownerTier = clean(body.ownerTier, 'free');
  const backdropId = clean(body.backdropId, 'soft-clouds');
  const backdropName = clean(body.backdropName, 'Backdrop');
  const accentColor = clean(body.accentColor, '#00FFFF');
  const title = typeof body.title === 'string' ? body.title : undefined;
  const description = typeof body.description === 'string' ? body.description : undefined;
  const sourceImageUrl = typeof body.sourceImageUrl === 'string' ? body.sourceImageUrl : null;
  const templateId = typeof body.templateId === 'string' ? body.templateId : undefined;
  const recipe = VALID_RECIPES.has(body.recipe as CreativeRecipe)
    ? (body.recipe as CreativeRecipe)
    : 'retro-vision-portrait';
  const studioIntent = VALID_INTENTS.has(body.studioIntent as StudioIntent)
    ? (body.studioIntent as StudioIntent)
    : undefined;
  const collectionName = typeof body.collectionName === 'string' ? body.collectionName : undefined;
  const outputs = Array.isArray(body.outputs)
    ? (body.outputs.filter((output): output is CreativeOutput => VALID_OUTPUTS.has(output as CreativeOutput)))
    : undefined;
  const sourceKind = body.sourceKind === 'fan-retro-vision' || body.sourceKind === 'performer-motion' || body.sourceKind === 'magazine-cover' || body.sourceKind === 'memory-card'
    ? body.sourceKind
    : 'fan-retro-vision';
  const mode = VALID_MODES.has(body.mode as CompositionMode) ? (body.mode as CompositionMode) : 'still';

  if (!ownerId || !ownerName || !backdropId) {
    return NextResponse.json({ ok: false, error: 'ownerId, ownerName, and backdropId are required' }, { status: 400 });
  }

  const plan = resolveCreativePlan({
    ownerName,
    mode,
    recipe,
    outputs,
    collectionName,
    sourceKind,
    studioIntent,
  });

  const collection = renderCreativeCollection({
    ownerId,
    ownerName,
    ownerTier,
    backdropId,
    backdropName,
    accentColor,
    sourceImageUrl,
    templateId,
    title,
    description,
    sourceKind: plan.sourceKind,
    recipe: plan.recipe,
    outputs: plan.outputs,
    collectionName: plan.collectionName,
  });

  const firstJob = collection.jobs[0] ?? submitComposition({
    ownerId,
    ownerName,
    ownerTier,
    backdropId,
    backdropName,
    mode,
    accentColor,
    sourceImageUrl,
    templateId,
    title,
    description,
    sourceKind,
  });

  return NextResponse.json({ ok: true, job: firstJob, collection });
}

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('jobId');
  const collectionId = req.nextUrl.searchParams.get('collectionId');
  const ownerId = req.nextUrl.searchParams.get('ownerId') || undefined;

  if (jobId) {
    const job = getCompositionJob(jobId);
    if (!job) {
      return NextResponse.json({ ok: false, error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, job });
  }

  if (collectionId) {
    const collection = getCreativeCollection(collectionId);
    if (!collection) {
      return NextResponse.json({ ok: false, error: 'Collection not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, collection });
  }

  return NextResponse.json({
    ok: true,
    jobs: listCompositionJobs(ownerId),
    collections: listCreativeCollections(ownerId),
  });
}
