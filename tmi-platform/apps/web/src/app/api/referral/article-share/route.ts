export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/TMISecurityEngine';
import {
  getArticleShareSnapshot,
  recordArticleShareEvent,
  type ArticleShareEventType,
  type ArticleShareMode,
} from '@/lib/share/ArticleShareTrackingEngine';
import { awardXP } from '@/lib/profile/ProfileRewardsEngine';

interface ShareBody {
  event: ArticleShareEventType;
  articleSlug: string;
  performerSlug: string;
  referrerId?: string;
  mode?: ArticleShareMode;
  source?: string;
  platform?: string;
}

const VALID_EVENTS = new Set<ArticleShareEventType>(['share', 'copy', 'open', 'click', 'engaged_read']);
const VALID_MODES = new Set<ArticleShareMode>(['still', 'motion', 'live', 'premiere']);

function cleanId(input: string | undefined, fallback: string): string {
  if (!input) return fallback;
  const normalized = input.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
  return normalized || fallback;
}

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rate = checkRateLimit(`article-share:${ip}`, 80, 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ ok: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  let body: Partial<ShareBody>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const event = body.event;
  if (!event || !VALID_EVENTS.has(event)) {
    return NextResponse.json({ ok: false, error: 'Invalid share event' }, { status: 400 });
  }

  const articleSlug = cleanId(body.articleSlug, 'article');
  const performerSlug = cleanId(body.performerSlug, 'performer');
  const referrerId = cleanId(body.referrerId, performerSlug);
  const mode = body.mode && VALID_MODES.has(body.mode) ? body.mode : 'still';

  const snapshot = recordArticleShareEvent({
    event,
    articleSlug,
    performerSlug,
    referrerId,
    mode,
    source: body.source,
    platform: body.platform,
    occurredAt: Date.now(),
  });

  // Keep rewards tied to real actions only; impressions are not read equivalents.
  if (event === 'share') {
    await awardXP(performerSlug, 20, 'Article Shared');
  }
  if (event === 'engaged_read' && referrerId) {
    await awardXP(referrerId, 12, 'Article Engaged Read Referral');
  }

  return NextResponse.json({ ok: true, snapshot });
}

export async function GET(req: NextRequest) {
  const articleSlug = cleanId(req.nextUrl.searchParams.get('articleSlug') || undefined, 'article');
  return NextResponse.json({ ok: true, snapshot: getArticleShareSnapshot(articleSlug) });
}
