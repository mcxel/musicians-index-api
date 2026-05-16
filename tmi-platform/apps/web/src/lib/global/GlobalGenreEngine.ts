export interface GlobalGenre {
  genreId: string;
  name: string;
  originCountry: string;
  countryCode: string;
  flag: string;
  language: string;
  bpmRange: [number, number];
  description: string;
  culturalContext: string;
  instruments: string[];
  keyArtists: string[];
  relatedGenres: string[];
  accentColor: string;
}

const GENRES: GlobalGenre[] = [
  { genreId: "afrobeats",   name: "Afrobeats",    originCountry: "Nigeria",       countryCode: "NG", flag: "🇳🇬", language: "English / Yoruba",   bpmRange: [90, 110],  description: "West African pop with percussion-driven grooves and melodic hooks", culturalContext: "Born in Lagos nightclubs fusing highlife, funk, and jazz", instruments: ["talking drum", "shekere", "guitar", "keyboards"], keyArtists: ["Burna Boy", "Wizkid", "Davido", "Tems"], relatedGenres: ["afropop", "dancehall", "r&b"], accentColor: "#00FF88" },
  { genreId: "dancehall",   name: "Dancehall",    originCountry: "Jamaica",       countryCode: "JM", flag: "🇯🇲", language: "Patois",             bpmRange: [75, 95],   description: "Jamaican evolution of reggae — faster riddims, toasting, and raw energy", culturalContext: "Sound system culture, yard dances, and Kingston street life", instruments: ["riddim machine", "bass", "keyboard"], keyArtists: ["Vybz Kartel", "Popcaan", "Skillibeng", "Spice"], relatedGenres: ["reggae", "soca", "afrobeats"], accentColor: "#FFD700" },
  { genreId: "amapiano",    name: "Amapiano",     originCountry: "South Africa",  countryCode: "ZA", flag: "🇿🇦", language: "Zulu / Sotho / English", bpmRange: [108, 116], description: "Log drum meets house — South Africa's defining 2020s sound", culturalContext: "Emerged from Pretoria townships, now exported worldwide", instruments: ["log drum", "piano", "bass", "marimba"], keyArtists: ["Kabza De Small", "DJ Maphorisa", "Focalistic"], relatedGenres: ["house", "kwaito", "afrohouse"], accentColor: "#FF9500" },
  { genreId: "uk-grime",    name: "UK Grime",     originCountry: "United Kingdom", countryCode: "GB", flag: "🇬🇧", language: "English",            bpmRange: [136, 142], description: "East London MCing over dark electronic beats — the street sound of 2000s UK", culturalContext: "Developed in council estates, pirate radio, and East London raves", instruments: ["Roland MC-505", "synths", "808"], keyArtists: ["Dizzee Rascal", "Stormzy", "Wiley", "Skepta"], relatedGenres: ["uk-drill", "jungle", "garage"], accentColor: "#FF2DAA" },
  { genreId: "reggaeton",   name: "Reggaeton",    originCountry: "Puerto Rico",   countryCode: "PR", flag: "🇵🇷", language: "Spanish",            bpmRange: [85, 100],  description: "Dembow rhythm from Panama via Jamaica — Latin music's global bridge", culturalContext: "Underground in 1990s San Juan, now the most streamed genre on Earth", instruments: ["dembow drum", "808", "synth"], keyArtists: ["Daddy Yankee", "J Balvin", "Bad Bunny", "Ozuna"], relatedGenres: ["latin-trap", "dembow", "perreo"], accentColor: "#AA2DFF" },
  { genreId: "k-hiphop",    name: "K-Hip-Hop",   originCountry: "South Korea",   countryCode: "KR", flag: "🇰🇷", language: "Korean",             bpmRange: [80, 120],  description: "Seoul underground hip-hop fusing American rap with Korean cultural identity", culturalContext: "Grew from Hongdae district clubs and indie labels fighting pop industry gatekeepers", instruments: ["808", "sampler", "live drums"], keyArtists: ["Zico", "G-Dragon", "Jay Park", "Tiger JK"], relatedGenres: ["kpop", "j-hiphop", "trap"], accentColor: "#FF6B9D" },
  { genreId: "soca",        name: "Soca",         originCountry: "Trinidad",      countryCode: "TT", flag: "🇹🇹", language: "English / Creole",   bpmRange: [120, 145], description: "Soul of calypso — pure carnival energy designed for dancing", culturalContext: "Born in 1970s Port of Spain as calypso evolved, now anchors Caribbean carnival", instruments: ["steel pan", "brass", "bass", "drums"], keyArtists: ["Machel Montano", "Bunji Garlin", "Nadia Batson"], relatedGenres: ["calypso", "dancehall", "zouk"], accentColor: "#FF2DAA" },
  { genreId: "latin-trap",  name: "Latin Trap",   originCountry: "Colombia",      countryCode: "CO", flag: "🇨🇴", language: "Spanish",            bpmRange: [60, 80],   description: "American trap production meets Latin street culture and reggaeton roots", culturalContext: "Came from underground clubs in Medellín, Miami, and San Juan simultaneously", instruments: ["trap hi-hats", "808", "piano", "synths"], keyArtists: ["Bad Bunny", "Anuel AA", "Jhay Cortez"], relatedGenres: ["reggaeton", "trap", "drill"], accentColor: "#00FF88" },
  { genreId: "french-rap",  name: "French Rap",   originCountry: "France",        countryCode: "FR", flag: "🇫🇷", language: "French",             bpmRange: [75, 110],  description: "Banlieue poetry meets Congolese heritage and North African roots", culturalContext: "Grew in Parisian suburbs (banlieues) from immigrant communities", instruments: ["sampler", "bass", "synths"], keyArtists: ["Ninho", "Damso", "Nekfeu", "SCH"], relatedGenres: ["trap", "afropop", "r&b"], accentColor: "#00FFFF" },
  { genreId: "desi-hiphop", name: "Desi Hip-Hop", originCountry: "India",         countryCode: "IN", flag: "🇮🇳", language: "Hindi / Punjabi / English", bpmRange: [70, 100], description: "Mumbai street rap fusing Bollywood samples, regional languages, and trap production", culturalContext: "Underground movement defying Bollywood, inspired by Dharavi, Colaba street life", instruments: ["tabla", "sitar samples", "808", "harmonium"], keyArtists: ["Divine", "Naezy", "Kr$na", "Raftaar"], relatedGenres: ["bhangra-trap", "bollywood-trap"], accentColor: "#FFB347" },
];

export function getAllGlobalGenres(): GlobalGenre[] {
  return GENRES;
}

export function getGenreById(genreId: string): GlobalGenre | null {
  return GENRES.find(g => g.genreId === genreId) ?? null;
}

export function getGenresByCountry(countryCode: string): GlobalGenre[] {
  return GENRES.filter(g => g.countryCode === countryCode.toUpperCase());
}

export function getUnfamiliarGenres(userKnownGenres: string[], limit = 4): GlobalGenre[] {
  return GENRES.filter(g => !userKnownGenres.includes(g.genreId)).slice(0, limit);
}

export function getRelatedGenres(genreId: string): GlobalGenre[] {
  const genre = getGenreById(genreId);
  if (!genre) return [];
  return GENRES.filter(g => genre.relatedGenres.includes(g.genreId));
}
