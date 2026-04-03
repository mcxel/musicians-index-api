/**
 * Belt Feed API — Homepage article auto-placement
 * Returns articles grouped by belt, or filtered to a single belt.
 * Proxies to NestJS API; falls back to stub data when unavailable.
 */
import { proxyToApi } from '@/lib/apiProxy';
import { type NextRequest, NextResponse } from 'next/server';
import { groupArticlesByBelt, type BeltKey } from '@/lib/articlePlacement';

const STUB_ARTICLES = [
  { id: '1', title: 'The New Wave: Gen Z Is Reshaping Hip-Hop', slug: 'gen-z-reshaping-hip-hop', category: 'FEATURED', excerpt: 'How the next generation is changing the game.', publishedAt: '2026-03-15', author: { name: 'TMI Editorial' } },
  { id: '2', title: 'Crown Season Week 14: Voting Closes Friday', slug: 'crown-season-week-14', category: 'NEWS', excerpt: 'The stakes are higher than ever heading into the final round.', publishedAt: '2026-03-14', author: { name: 'Staff Reporter' } },
  { id: '3', title: 'Amirah Wells: Touring, Healing & The Next Era', slug: 'amirah-wells-interview', category: 'INTERVIEW', excerpt: 'An intimate conversation with the R&B star about her journey.', publishedAt: '2026-03-13', author: { name: 'Deja Monroe' } },
  { id: '4', title: '"Crown Season Vol. 3" — Full Review', slug: 'crown-season-vol-3-review', category: 'REVIEW', excerpt: 'Jaylen Cross delivers his most personal project to date.', publishedAt: '2026-03-12', author: { name: 'Marcus Bell' } },
  { id: '5', title: 'TMI Awards Show: Miami — Full Lineup Revealed', slug: 'tmi-awards-miami-lineup', category: 'EVENTS', excerpt: 'Stars confirmed for the June 20th grand ceremony.', publishedAt: '2026-03-11', author: { name: 'Events Desk' } },
  { id: '6', title: 'Traxx Monroe: Trap Production Secrets', slug: 'traxx-monroe-production', category: 'INTERVIEW', excerpt: "Inside the studio with one of trap's most prolific producers.", publishedAt: '2026-03-10', author: { name: 'Kira Sims' } },
  { id: '7', title: 'Nova Reign — "Frequencies" Visual Breakdown', slug: 'nova-reign-frequencies', category: 'ARTIST', excerpt: '2M views and counting — we break down the video scene by scene.', publishedAt: '2026-03-09', author: { name: 'TMI Visual' } },
  { id: '8', title: 'Weekly Chart: Hip-Hop Dominates Again', slug: 'weekly-chart-hip-hop', category: 'CHART', excerpt: 'Top 10 most-streamed tracks this week on the Index.', publishedAt: '2026-03-08', author: { name: 'Chart Bot' } },
  { id: '9', title: 'Midnight Frequencies: The Story Behind the Sound', slug: 'midnight-frequencies-story', category: 'RANDOM', excerpt: 'A deep dive into how an unexpected hit was born.', publishedAt: '2026-03-07', author: { name: 'Lyric James' } },
  { id: '10', title: 'BeatLabels Partners with TMI Platform', slug: 'beatlabels-tmi-partnership', category: 'SPONSOR', excerpt: 'New tools for independent artists launching this spring.', publishedAt: '2026-03-06', author: { name: 'Partnerships' } },
  { id: '11', title: 'Platform Hits 500K Active Members Milestone', slug: 'platform-500k-milestone', category: 'NEWS', excerpt: 'The Musicians Index celebrates a landmark achievement.', publishedAt: '2026-03-05', author: { name: 'Staff Reporter' } },
  { id: '12', title: 'DJ Cyphers Mix Goes Viral — 500K Streams in 48 Hours', slug: 'dj-cyphers-viral-mix', category: 'NEWS', excerpt: "Hip-hop's hottest DJ hits a new personal record.", publishedAt: '2026-03-04', author: { name: 'Hot Takes' } },
];

export async function GET(req: NextRequest) {
  const belt = req.nextUrl.searchParams.get('belt') as BeltKey | null;
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '20', 10);

  // Try NestJS API first
  try {
    const path = belt
      ? `/editorial/articles/belt-feed?belt=${belt}&limit=${limit}`
      : `/editorial/articles/belt-feed?limit=${limit}`;
    const apiRes = await proxyToApi(req as unknown as Request, path);
    if (apiRes.status === 200) return apiRes;
  } catch {
    // fall through to stubs
  }

  // Stub fallback — grouped by belt
  const grouped = groupArticlesByBelt(STUB_ARTICLES);

  if (belt) {
    const beltData = (grouped[belt] ?? []).slice(0, limit);
    return NextResponse.json(beltData);
  }

  // Return all belts (capped per belt)
  const capped = Object.fromEntries(
    Object.entries(grouped).map(([k, v]) => [k, (v as typeof STUB_ARTICLES).slice(0, limit)])
  );
  return NextResponse.json(capped);
}
