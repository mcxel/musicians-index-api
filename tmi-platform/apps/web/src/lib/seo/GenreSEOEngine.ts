import { SEO_BRAND } from "./SeoBrandConfig";

export interface GenrePage {
  genre: string;
  slug: string;
  label: string;
  description: string;
  longDescription: string;
  artistCount: number;
  battlesThisWeek: number;
  venueCount: number;
  relatedGenres: string[];
  topArtists: Array<{ name: string; slug: string; location: string }>;
  keywords: string[];
  canonical: string;
}

const GENRE_PAGES: GenrePage[] = [
  {
    genre: "Hip-Hop",
    slug: "hip-hop",
    label: "Hip-Hop Artists",
    description: `Discover independent hip-hop artists competing and performing on ${SEO_BRAND.PRODUCT_NAME}. Weekly battles, cyphers, and live events.`,
    longDescription: "Hip-hop is the most active genre on TMI. From East Coast boom-bap to Atlanta trap to West Coast g-funk — independent artists from every corner of the country battle, record, and connect with fans here.",
    artistCount: 320,
    battlesThisWeek: 28,
    venueCount: 45,
    relatedGenres: ["trap", "drill", "r&b", "conscious-rap"],
    topArtists: [
      { name: "Ray Journey",  slug: "ray-journey",  location: "Atlanta, GA" },
      { name: "Nova Cipher",  slug: "nova-cipher",  location: "Houston, TX" },
      { name: "Krypt",        slug: "krypt",        location: "Detroit, MI" },
      { name: "Wavetek",      slug: "wavetek",      location: "New York, NY" },
    ],
    keywords: ["hip-hop artists", "independent rappers", "best new rappers", "rising hip-hop artists", "underground hip-hop", "rap battles online"],
    canonical: `${SEO_BRAND.ROOT_CANONICAL}/genres/hip-hop`,
  },
  {
    genre: "R&B",
    slug: "r-and-b",
    label: "R&B Artists",
    description: `Independent R&B artists on ${SEO_BRAND.PRODUCT_NAME} — soulful voices, live shows, and weekly vocal competitions.`,
    longDescription: "R&B on TMI covers everything from neo-soul to contemporary vocal performance. Artists compete in vocal battles, host listening rooms, and build fan communities in real time.",
    artistCount: 180,
    battlesThisWeek: 12,
    venueCount: 28,
    relatedGenres: ["soul", "neo-soul", "pop", "hip-hop"],
    topArtists: [
      { name: "Lena Sky",    slug: "lena-sky",    location: "Los Angeles, CA" },
      { name: "Sol Carter",  slug: "sol-carter",  location: "Nashville, TN" },
    ],
    keywords: ["R&B artists", "independent R&B singers", "new R&B artists", "rising R&B singers", "best R&B artists 2026"],
    canonical: `${SEO_BRAND.ROOT_CANONICAL}/genres/r-and-b`,
  },
  {
    genre: "Country",
    slug: "country",
    label: "Country Artists",
    description: `Country and Americana artists on ${SEO_BRAND.PRODUCT_NAME} — live performances, songwriting battles, and fan communities.`,
    longDescription: "Country music's independent scene is growing fast on TMI. Artists from Nashville to rural America bring authentic stories, songwriting battles, and live acoustic sets to the platform.",
    artistCount: 95,
    battlesThisWeek: 6,
    venueCount: 14,
    relatedGenres: ["americana", "folk", "bluegrass", "country-pop"],
    topArtists: [
      { name: "Sol Carter", slug: "sol-carter", location: "Nashville, TN" },
    ],
    keywords: ["country artists", "independent country singers", "new country artists", "rising country singers", "country music battles"],
    canonical: `${SEO_BRAND.ROOT_CANONICAL}/genres/country`,
  },
  {
    genre: "Trap",
    slug: "trap",
    label: "Trap Artists",
    description: `Trap artists competing and performing on ${SEO_BRAND.PRODUCT_NAME}. ATL-born genre with weekly battles and beat showcases.`,
    longDescription: "Trap music was born in Atlanta and TMI has the most active trap battle scene outside major labels. Independent trap artists bring heat to weekly cyphers, beat battles, and live sessions.",
    artistCount: 140,
    battlesThisWeek: 18,
    venueCount: 20,
    relatedGenres: ["hip-hop", "drill", "mumble-rap", "melodic-trap"],
    topArtists: [
      { name: "Nova Cipher", slug: "nova-cipher", location: "Houston, TX" },
      { name: "Wavetek",     slug: "wavetek",     location: "New York, NY" },
    ],
    keywords: ["trap artists", "trap rappers", "best trap artists", "new trap music", "independent trap artists"],
    canonical: `${SEO_BRAND.ROOT_CANONICAL}/genres/trap`,
  },
  {
    genre: "Afrobeats",
    slug: "afrobeats",
    label: "Afrobeats Artists",
    description: `Afrobeats artists on ${SEO_BRAND.PRODUCT_NAME} — the global sound of West Africa connecting with fans worldwide.`,
    longDescription: "Afrobeats is the fastest-growing global genre. TMI's Afrobeats scene connects artists from Nigeria, Ghana, and the diaspora to US audiences through live shows and cultural spotlights.",
    artistCount: 75,
    battlesThisWeek: 8,
    venueCount: 10,
    relatedGenres: ["afropop", "dancehall", "amapiano", "highlife"],
    topArtists: [
      { name: "Zuri Bloom", slug: "zuri-bloom", location: "Atlanta, GA" },
    ],
    keywords: ["afrobeats artists", "Nigerian artists", "afropop singers", "African music artists", "best afrobeats 2026"],
    canonical: `${SEO_BRAND.ROOT_CANONICAL}/genres/afrobeats`,
  },
  {
    genre: "Electronic",
    slug: "electronic",
    label: "Electronic & EDM Artists",
    description: `Electronic and EDM artists on ${SEO_BRAND.PRODUCT_NAME} — DJ sets, live productions, and weekly showcase events.`,
    longDescription: "Electronic music on TMI includes house, EDM, lo-fi, ambient, and experimental producers. DJ Showcases and beat battles run weekly for electronic artists to compete and connect.",
    artistCount: 88,
    battlesThisWeek: 5,
    venueCount: 12,
    relatedGenres: ["house", "edm", "lo-fi", "techno", "dubstep"],
    topArtists: [
      { name: "DJ Storm",  slug: "dj-storm",  location: "Miami, FL" },
      { name: "Neon Vibe", slug: "neon-vibe", location: "Las Vegas, NV" },
    ],
    keywords: ["electronic artists", "EDM artists", "independent DJs", "best DJs 2026", "electronic music performers"],
    canonical: `${SEO_BRAND.ROOT_CANONICAL}/genres/electronic`,
  },
  {
    genre: "Pop",
    slug: "pop",
    label: "Pop Artists",
    description: `Independent pop artists on ${SEO_BRAND.PRODUCT_NAME} — fan voting, live shows, and weekly pop competitions.`,
    longDescription: "Pop artists on TMI compete in fan-voted battles, host listening parties, and connect with audiences across demographics. The pop scene spans everything from indie pop to commercial crossover.",
    artistCount: 110,
    battlesThisWeek: 9,
    venueCount: 16,
    relatedGenres: ["r&b", "dance-pop", "indie-pop", "electropop"],
    topArtists: [
      { name: "Marcus Wave", slug: "marcus-wave", location: "Chicago, IL" },
    ],
    keywords: ["pop artists", "independent pop singers", "new pop artists", "rising pop artists 2026", "best new pop music"],
    canonical: `${SEO_BRAND.ROOT_CANONICAL}/genres/pop`,
  },
];

export function getGenrePage(slug: string): GenrePage | null {
  return GENRE_PAGES.find(g => g.slug === slug.toLowerCase()) ?? null;
}

export function getAllGenrePages(): GenrePage[] {
  return GENRE_PAGES;
}

export function getGenreByName(name: string): GenrePage | null {
  return GENRE_PAGES.find(g => g.genre.toLowerCase() === name.toLowerCase()) ?? null;
}

export function generateGenreMetaTitle(genre: GenrePage): string {
  return `${genre.label} — Independent ${genre.genre} Music | ${SEO_BRAND.PRODUCT_NAME}`;
}

export function generateGenreMetaDescription(genre: GenrePage): string {
  return `${genre.description} ${genre.artistCount} artists, ${genre.battlesThisWeek} battles this week.`;
}
