export interface CultureSpotlight {
  countryCode: string;
  country: string;
  flag: string;
  genre: string;
  featuredArtist: string;
  artistSlug: string;
  description: string;
  language: string;
  tags: string[];
}

export interface GlobalDiscoveryFeed {
  spotlights: CultureSpotlight[];
  liveShows: { title: string; country: string; flag: string; route: string }[];
  foreignBattles: { title: string; country: string; flag: string; route: string }[];
  internationalArtists: { name: string; country: string; flag: string; genre: string; slug: string }[];
  trendingSongs: { title: string; artist: string; country: string; flag: string }[];
}

const CULTURE_SPOTLIGHTS: CultureSpotlight[] = [
  { countryCode: "NG", country: "Nigeria",        flag: "🇳🇬", genre: "Afrobeats",    featuredArtist: "Ayra Starr",   artistSlug: "ayra-starr",   description: "Lagos-born fusion of highlife, pop, and street energy", language: "English / Yoruba", tags: ["afrobeats","highlife","lagos","naijavibes"] },
  { countryCode: "JM", country: "Jamaica",         flag: "🇯🇲", genre: "Dancehall",   featuredArtist: "Skillibeng",   artistSlug: "skillibeng",   description: "Kingston street energy meets melodic trap", language: "Patois / English", tags: ["dancehall","reggae","kingston","caribbean"] },
  { countryCode: "GB", country: "United Kingdom",  flag: "🇬🇧", genre: "UK Grime",    featuredArtist: "Stormzy",      artistSlug: "stormzy",      description: "East London urban sound built on MCing and garage beats", language: "English", tags: ["grime","ukrap","drill","roadman"] },
  { countryCode: "BR", country: "Brazil",          flag: "🇧🇷", genre: "Funk Carioca",featuredArtist: "MC Cabelinho", artistSlug: "mc-cabelinho", description: "Rio baile funk — dancefloor culture born in favelas", language: "Portuguese", tags: ["funk","baile","rio","favela"] },
  { countryCode: "KR", country: "South Korea",     flag: "🇰🇷", genre: "K-Hip-Hop",  featuredArtist: "Zico",         artistSlug: "zico",         description: "Seoul underground rap that rewrote the global hip-hop map", language: "Korean", tags: ["khiphop","seoul","kpop","underground"] },
  { countryCode: "CO", country: "Colombia",        flag: "🇨🇴", genre: "Reggaeton",  featuredArtist: "J Balvin",     artistSlug: "j-balvin",     description: "Medellín-born global Latin trap movement", language: "Spanish", tags: ["reggaeton","latintrap","medellin","urbano"] },
  { countryCode: "ZA", country: "South Africa",    flag: "🇿🇦", genre: "Amapiano",   featuredArtist: "Kabza De Small",artistSlug: "kabza-de-small",description: "Johannesburg log drum meets house — Africa's fastest growing genre", language: "Zulu / English", tags: ["amapiano","house","johannesburg","africa"] },
  { countryCode: "GH", country: "Ghana",           flag: "🇬🇭", genre: "Afropop",    featuredArtist: "Stonebwoy",    artistSlug: "stonebwoy",    description: "Accra gospel-infused dancehall and afrobeats fusion", language: "Twi / English", tags: ["afropop","ghana","accra","highlife"] },
  { countryCode: "TT", country: "Trinidad",        flag: "🇹🇹", genre: "Soca",       featuredArtist: "Machel Montano",artistSlug: "machel-montano",description: "Carnival soul — pure joyful energy from Port of Spain", language: "English / Creole", tags: ["soca","carnival","trinidad","caribbean"] },
  { countryCode: "JP", country: "Japan",           flag: "🇯🇵", genre: "J-Hip-Hop",  featuredArtist: "Kohh",         artistSlug: "kohh",         description: "Tokyo trap and introspective lyricism — Japan on its own terms", language: "Japanese", tags: ["jhiphop","tokyo","trap","japan"] },
  { countryCode: "FR", country: "France",          flag: "🇫🇷", genre: "French Rap", featuredArtist: "Ninho",        artistSlug: "ninho",        description: "Paris street rap with Congolese roots and European flow", language: "French", tags: ["frenchrap","paris","trap","banlieue"] },
  { countryCode: "IN", country: "India",           flag: "🇮🇳", genre: "Desi Hip-Hop",featuredArtist: "Divine",      artistSlug: "divine",       description: "Mumbai street poetry meets Bollywood-era production", language: "Hindi / English", tags: ["desihiphop","mumbai","bollyrap","india"] },
];

export function getCultureSpotlights(limit = 6): CultureSpotlight[] {
  return CULTURE_SPOTLIGHTS.slice(0, limit);
}

export function getSpotlightByCountry(countryCode: string): CultureSpotlight | null {
  return CULTURE_SPOTLIGHTS.find(s => s.countryCode === countryCode.toUpperCase()) ?? null;
}

export function getGlobalDiscoveryFeed(): GlobalDiscoveryFeed {
  return {
    spotlights: getCultureSpotlights(4),
    liveShows: [
      { title: "Afrobeats Night",    country: "Nigeria",       flag: "🇳🇬", route: "/live/rooms/afro-night" },
      { title: "Dancehall Friday",   country: "Jamaica",       flag: "🇯🇲", route: "/live/rooms/dancehall-friday" },
      { title: "Amapiano Sunday",    country: "South Africa",  flag: "🇿🇦", route: "/live/rooms/amapiano-sunday" },
      { title: "K-HipHop Cypher",   country: "South Korea",   flag: "🇰🇷", route: "/live/rooms/khiphop-cypher" },
    ],
    foreignBattles: [
      { title: "NG vs UK Freestyle", country: "Nigeria + UK",  flag: "🇳🇬🇬🇧", route: "/battles/ng-vs-uk" },
      { title: "Soca Showdown",      country: "Trinidad",      flag: "🇹🇹",     route: "/battles/soca-showdown" },
      { title: "Latin Trap Wars",    country: "Colombia",      flag: "🇨🇴",     route: "/battles/latin-trap-wars" },
    ],
    internationalArtists: CULTURE_SPOTLIGHTS.slice(0, 6).map(s => ({
      name: s.featuredArtist, country: s.country, flag: s.flag, genre: s.genre, slug: s.artistSlug,
    })),
    trendingSongs: [
      { title: "Essence",        artist: "Wizkid",        country: "Nigeria",      flag: "🇳🇬" },
      { title: "Knife Talk",     artist: "Drake",         country: "Canada",       flag: "🇨🇦" },
      { title: "温柔",           artist: "Mayday",        country: "Taiwan",       flag: "🇹🇼" },
      { title: "Lean On",        artist: "Major Lazer",   country: "United States",flag: "🇺🇸" },
      { title: "Shakira",        artist: "Cardi B",       country: "United States",flag: "🇺🇸" },
    ],
  };
}

export function getRecommendedCulturesForUser(userCountryCode: string, limit = 3): CultureSpotlight[] {
  return CULTURE_SPOTLIGHTS.filter(s => s.countryCode !== userCountryCode.toUpperCase()).slice(0, limit);
}
