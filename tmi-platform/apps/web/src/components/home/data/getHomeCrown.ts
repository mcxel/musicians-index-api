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

const FALLBACK_CROWN_DATA: HomeCrownData = {
  winners: [
    { name: 'JAYLEN CROSS', genre: 'Hip-Hop', title: '"Crown Season" Vol. 3', votes: '24,881', week: 'Week 14' },
    { name: 'AMIRAH WELLS', genre: 'R&B / Soul', title: '"Midnight Frequencies"', votes: '19,440', week: 'Week 13' },
    { name: 'DESTINED', genre: 'Neo-Soul', title: '"Unwritten Maps"', votes: '17,220', week: 'Week 12' },
  ],
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
        : FALLBACK_CROWN_DATA.winners[0].name;

    const featuredGenre = Array.isArray(featured?.genres) && typeof featured.genres[0] === 'string'
      ? featured.genres[0]
      : typeof featured?.genre === 'string'
        ? featured.genre
        : FALLBACK_CROWN_DATA.winners[0].genre;

    const featuredTitle = typeof featured?.headline === 'string'
      ? featured.headline
      : typeof featured?.title === 'string'
        ? featured.title
        : FALLBACK_CROWN_DATA.winners[0].title;

    const contestWeek = typeof contest?.name === 'string'
      ? contest.name
      : typeof contest?.weekLabel === 'string'
        ? contest.weekLabel
        : FALLBACK_CROWN_DATA.winners[0].week;

    const winners = [
      {
        name: featuredName,
        genre: featuredGenre,
        title: featuredTitle,
        votes: typeof contest?.votes === 'number' ? contest.votes.toLocaleString() : FALLBACK_CROWN_DATA.winners[0].votes,
        week: contestWeek,
      },
      ...FALLBACK_CROWN_DATA.winners.slice(1),
    ];

    const genres = Array.from(new Set(winners.map((winner) => winner.genre).concat(FALLBACK_CROWN_DATA.genres))).slice(0, 8);

    return { winners, genres };
  } catch {
    return FALLBACK_CROWN_DATA;
  }
}