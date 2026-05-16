export interface SongMeaning {
  songId: string;
  title: string;
  artist: string;
  countryCode: string;
  genre: string;
  language: string;
  hookMeaning: string;
  chorusMeaning: string;
  slangBreakdown: Array<{ term: string; meaning: string; culturalNote: string }>;
  culturalContext: string;
  genreContext: string;
  dontEraseCulture: boolean;
}

const songMeanings = new Map<string, SongMeaning>();

const SAMPLE_MEANINGS: SongMeaning[] = [
  {
    songId: "essence-wizkid",
    title: "Essence",
    artist: "Wizkid",
    countryCode: "NG",
    genre: "afrobeats",
    language: "en/yo",
    hookMeaning: "'You and the things you do' — a declaration of being captivated by someone's presence and energy, not just their looks",
    chorusMeaning: "The chorus expresses helpless romantic obsession in the Afrobeats tradition — romantic love as a physical, communal experience",
    slangBreakdown: [
      { term: "Essence", meaning: "Core nature — what makes someone who they are", culturalNote: "In Yoruba culture, acknowledging someone's essence is a deep compliment beyond physical attraction" },
    ],
    culturalContext: "Wizkid's 'Essence' became a global phenomenon in 2021 because it captured the universal feeling of romantic connection through a distinctly Nigerian sonic lens — Afrobeats percussion, call-and-response vocals, and melodic flow.",
    genreContext: "Afrobeats love songs favor feeling over explicitness — the rhythm carries the emotional weight that words leave unsaid.",
    dontEraseCulture: true,
  },
];

function seed() {
  if (songMeanings.size === 0) {
    for (const s of SAMPLE_MEANINGS) songMeanings.set(s.songId, s);
  }
}

export function getSongMeaning(songId: string): SongMeaning | null {
  seed();
  return songMeanings.get(songId) ?? null;
}

export function registerSongMeaning(meaning: SongMeaning): void {
  seed();
  songMeanings.set(meaning.songId, meaning);
}

export function getSongsByCountry(countryCode: string): SongMeaning[] {
  seed();
  return [...songMeanings.values()].filter(s => s.countryCode === countryCode.toUpperCase());
}

export function getSongsByGenre(genre: string): SongMeaning[] {
  seed();
  return [...songMeanings.values()].filter(s => s.genre === genre);
}

export function getSlangBreakdown(songId: string): SongMeaning["slangBreakdown"] {
  seed();
  return songMeanings.get(songId)?.slangBreakdown ?? [];
}
