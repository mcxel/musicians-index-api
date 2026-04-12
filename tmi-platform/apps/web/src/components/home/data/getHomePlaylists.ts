export interface HomePlaylistItem {
  id: string;
  title: string;
  curator: string;
  genre: string;
}

const FALLBACK_PLAYLISTS: HomePlaylistItem[] = [
  { id: '1', title: 'Weekly Crown Rotation', curator: 'TMI Editorial', genre: 'Multi-Genre' },
  { id: '2', title: 'After Hours R&B', curator: 'TMI Radio', genre: 'R&B / Soul' },
  { id: '3', title: 'Cypher Heat Index', curator: 'Chart Bot', genre: 'Hip-Hop' },
  { id: '4', title: 'Undiscovered Boost', curator: 'Discovery Desk', genre: 'Emerging Artists' },
];

export async function getHomePlaylists(limit = 4): Promise<HomePlaylistItem[]> {
  try {
    const response = await fetch(`/api/homepage/belt-feed?belt=playlists&limit=${limit}`, { cache: 'no-store' });
    if (!response.ok) return FALLBACK_PLAYLISTS.slice(0, limit);

    const data = (await response.json()) as Array<Record<string, unknown>>;
    if (!Array.isArray(data) || data.length === 0) return FALLBACK_PLAYLISTS.slice(0, limit);

    return data.slice(0, limit).map((item, index) => ({
      id: typeof item.id === 'string' ? item.id : `${index + 1}`,
      title: typeof item.title === 'string' ? item.title : `Playlist ${index + 1}`,
      curator: typeof item.author === 'object' && item.author !== null && typeof (item.author as Record<string, unknown>).name === 'string'
        ? (item.author as Record<string, string>).name
        : 'TMI Editorial',
      genre: typeof item.category === 'string' ? item.category : 'Playlist',
    }));
  } catch {
    return FALLBACK_PLAYLISTS.slice(0, limit);
  }
}