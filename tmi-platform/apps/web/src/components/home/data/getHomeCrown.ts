export interface HomeCrownWinner {
  name: string;
  genre: string;
  title: string;
  votes: string;
  week: string;
}

export interface HomeCrownData {
  winners: HomeCrownWinner[];
  genres: string[];
}

/**
 * Rule 20: no fabricated crown winners/vote counts. Empty until a real featured
 * artist/contest exists — genres stays a static taxonomy list (not an activity
 * claim), never padded with fake companion winners.
 */
const FALLBACK_CROWN_DATA: HomeCrownData = {
  winners: [],
  genres: ['Hip-Hop', 'R&B / Soul', 'Neo-Soul', 'Trap', 'Afrobeats', 'Gospel', 'Jazz Fusion', 'Lo-Fi'],
};

export async function getHomeCrown(): Promise<HomeCrownData> {
  try {
    const [featuredResponse, contestResponse] = await Promise.all([
      fetch('/api/homepage/featured-artist', { cache: 'no-store' }),
      fetch('/api/homepage/contest', { cache: 'no-store' }),
    ]);

    const featured = featuredResponse.ok ? ((await featuredResponse.json()) as Record<string, unknown> | null) : null;
    const contest = contestResponse.ok ? ((await contestResponse.json()) as Record<string, unknown> | null) : null;

    const featuredName = typeof featured?.stageName === 'string'
      ? featured.stageName.toUpperCase()
      : typeof featured?.name === 'string'
        ? featured.name.toUpperCase()
        : null;

    // Only build a winner entry when the featured-artist call returned a real name —
    // never splice in a real name alongside fabricated genre/title/votes/week.
    if (!featuredName) {
      return FALLBACK_CROWN_DATA;
    }

    const featuredGenre = Array.isArray(featured?.genres) && typeof featured.genres[0] === 'string'
      ? featured.genres[0]
      : typeof featured?.genre === 'string'
        ? featured.genre
        : 'Music';

    const featuredTitle = typeof featured?.headline === 'string'
      ? featured.headline
      : typeof featured?.title === 'string'
        ? featured.title
        : '';

    const contestWeek = typeof contest?.name === 'string'
      ? contest.name
      : typeof contest?.weekLabel === 'string'
        ? contest.weekLabel
        : '';

    const winners = [
      {
        name: featuredName,
        genre: featuredGenre,
        title: featuredTitle,
        votes: typeof contest?.votes === 'number' ? contest.votes.toLocaleString() : '',
        week: contestWeek,
      },
    ];

    const genres = Array.from(new Set(winners.map((winner) => winner.genre).concat(FALLBACK_CROWN_DATA.genres))).slice(0, 8);

    return { winners, genres };
  } catch {
    return FALLBACK_CROWN_DATA;
  }
}