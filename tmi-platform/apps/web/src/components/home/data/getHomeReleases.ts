export interface HomeReleaseRow {
  id: string;
  slug: string;
  title: string;
  genre: string;
  bpm: number;
  playCount: number;
  createdAt: string;
  color: string;
}

const GENRE_COLORS: Record<string, string> = {
  'hip-hop': '#00FFFF',
  rap: '#00FFFF',
  trap: '#FFD700',
  'r&b': '#FF2DAA',
  soul: '#FF2DAA',
  'neo-soul': '#AA2DFF',
  afrobeats: '#2DFFAA',
  pop: '#FF6B2D',
  electronic: '#00FFFF',
};

function genreColor(genre: string): string {
  return GENRE_COLORS[genre.toLowerCase()] ?? '#AA2DFF';
}

const FALLBACK_RELEASES: HomeReleaseRow[] = [
  { id: '1', slug: '', title: 'Frequencies', genre: 'Neo-Soul', bpm: 90, playCount: 0, createdAt: '', color: '#FF2DAA' },
  { id: '2', slug: '', title: 'Crown Season Vol. 3', genre: 'Hip-Hop', bpm: 96, playCount: 0, createdAt: '', color: '#00FFFF' },
  { id: '3', slug: '', title: 'Mirror Language', genre: 'R&B', bpm: 82, playCount: 0, createdAt: '', color: '#AA2DFF' },
  { id: '4', slug: '', title: 'Underground Atlas', genre: 'Trap', bpm: 140, playCount: 0, createdAt: '', color: '#FFD700' },
  { id: '5', slug: '', title: 'Midnight Frequencies', genre: 'R&B / Soul', bpm: 88, playCount: 0, createdAt: '', color: '#2DFFAA' },
  { id: '6', slug: '', title: 'Unwritten Maps', genre: 'Neo-Soul', bpm: 95, playCount: 0, createdAt: '', color: '#FF6B2D' },
];

export async function getHomeReleases(limit = 6): Promise<HomeReleaseRow[]> {
  try {
    const response = await fetch(`/api/homepage/new-releases?limit=${limit}`, { cache: 'no-store' });
    if (!response.ok) return FALLBACK_RELEASES.slice(0, limit);

    const data = (await response.json()) as Array<Record<string, unknown>>;
    if (!Array.isArray(data) || data.length === 0) return FALLBACK_RELEASES.slice(0, limit);

    return data.slice(0, limit).map((item, index) => {
      const genre = typeof item.genre === 'string' ? item.genre : 'Music';
      return {
        id: typeof item.id === 'string' ? item.id : `${index + 1}`,
        slug: typeof item.slug === 'string' ? item.slug : '',
        title: typeof item.title === 'string' ? item.title : `Release ${index + 1}`,
        genre,
        bpm: typeof item.bpm === 'number' ? item.bpm : 0,
        playCount: typeof item.playCount === 'number' ? item.playCount : 0,
        createdAt: typeof item.createdAt === 'string' ? item.createdAt : '',
        color: genreColor(genre),
      };
    });
  } catch {
    return FALLBACK_RELEASES.slice(0, limit);
  }
}