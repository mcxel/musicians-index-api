export interface CountryRecord {
  countryCode: string;
  name: string;
  flag: string;
  languages: string[];
  primaryGenre: string;
  genres: string[];
  capital: string;
  region: "africa" | "americas" | "asia" | "europe" | "oceania" | "caribbean";
  translationAvailable: boolean;
  captionAvailable: boolean;
  hasHub: boolean;
}

const REGISTRY: CountryRecord[] = [
  { countryCode: "US", name: "United States",  flag: "🇺🇸", languages: ["en"],         primaryGenre: "Hip-Hop",      genres: ["hip-hop","r&b","country","trap","gospel"],       capital: "Washington D.C.", region: "americas",  translationAvailable: true,  captionAvailable: true,  hasHub: true },
  { countryCode: "NG", name: "Nigeria",         flag: "🇳🇬", languages: ["en","yo","ig","ha"], primaryGenre: "Afrobeats",  genres: ["afrobeats","afropop","highlife","fuji"],        capital: "Abuja",           region: "africa",    translationAvailable: true,  captionAvailable: true,  hasHub: true },
  { countryCode: "GB", name: "United Kingdom",  flag: "🇬🇧", languages: ["en"],         primaryGenre: "Grime",        genres: ["grime","uk-drill","garage","jungle","dnb"],       capital: "London",          region: "europe",    translationAvailable: true,  captionAvailable: true,  hasHub: true },
  { countryCode: "JM", name: "Jamaica",         flag: "🇯🇲", languages: ["en","pat"],   primaryGenre: "Dancehall",    genres: ["dancehall","reggae","roots","dub"],               capital: "Kingston",        region: "caribbean", translationAvailable: true,  captionAvailable: true,  hasHub: true },
  { countryCode: "BR", name: "Brazil",          flag: "🇧🇷", languages: ["pt"],         primaryGenre: "Funk Carioca", genres: ["funk","samba","forró","bossa-nova","axé"],        capital: "Brasília",        region: "americas",  translationAvailable: true,  captionAvailable: true,  hasHub: true },
  { countryCode: "KR", name: "South Korea",     flag: "🇰🇷", languages: ["ko"],         primaryGenre: "K-Hip-Hop",   genres: ["k-hiphop","kpop","indie","trot"],                 capital: "Seoul",           region: "asia",      translationAvailable: true,  captionAvailable: true,  hasHub: true },
  { countryCode: "ZA", name: "South Africa",    flag: "🇿🇦", languages: ["en","zu","xh","af"], primaryGenre: "Amapiano", genres: ["amapiano","kwaito","afrohouse","maskandi"],      capital: "Pretoria",        region: "africa",    translationAvailable: true,  captionAvailable: true,  hasHub: true },
  { countryCode: "GH", name: "Ghana",           flag: "🇬🇭", languages: ["en","tw","ga"], primaryGenre: "Highlife",   genres: ["highlife","hiplife","afropop","gospel"],          capital: "Accra",           region: "africa",    translationAvailable: true,  captionAvailable: false, hasHub: true },
  { countryCode: "TT", name: "Trinidad",        flag: "🇹🇹", languages: ["en","cr"],    primaryGenre: "Soca",        genres: ["soca","calypso","chutney","dancehall"],           capital: "Port of Spain",   region: "caribbean", translationAvailable: true,  captionAvailable: false, hasHub: true },
  { countryCode: "JP", name: "Japan",           flag: "🇯🇵", languages: ["ja"],         primaryGenre: "J-Hip-Hop",   genres: ["j-hiphop","city-pop","jpop","visual-kei"],        capital: "Tokyo",           region: "asia",      translationAvailable: true,  captionAvailable: true,  hasHub: true },
  { countryCode: "FR", name: "France",          flag: "🇫🇷", languages: ["fr"],         primaryGenre: "French Rap",  genres: ["french-rap","chanson","electro","house"],          capital: "Paris",           region: "europe",    translationAvailable: true,  captionAvailable: true,  hasHub: true },
  { countryCode: "CO", name: "Colombia",        flag: "🇨🇴", languages: ["es"],         primaryGenre: "Reggaeton",   genres: ["reggaeton","vallenato","cumbia","latin-trap"],     capital: "Bogotá",          region: "americas",  translationAvailable: true,  captionAvailable: true,  hasHub: true },
  { countryCode: "IN", name: "India",           flag: "🇮🇳", languages: ["hi","pa","en","ta"], primaryGenre: "Desi Hip-Hop", genres: ["desi-hiphop","bhangra","filmi","indie"],   capital: "New Delhi",       region: "asia",      translationAvailable: true,  captionAvailable: true,  hasHub: true },
  { countryCode: "CA", name: "Canada",          flag: "🇨🇦", languages: ["en","fr"],   primaryGenre: "Hip-Hop",     genres: ["hip-hop","r&b","pop","electronic"],               capital: "Ottawa",          region: "americas",  translationAvailable: true,  captionAvailable: true,  hasHub: true },
];

const map = new Map(REGISTRY.map(c => [c.countryCode, c]));

export function getAllCountries(): CountryRecord[] {
  return REGISTRY;
}

export function getCountry(countryCode: string): CountryRecord | null {
  return map.get(countryCode.toUpperCase()) ?? null;
}

export function getCountriesByRegion(region: CountryRecord["region"]): CountryRecord[] {
  return REGISTRY.filter(c => c.region === region);
}

export function getHubCountries(): CountryRecord[] {
  return REGISTRY.filter(c => c.hasHub);
}

export function searchCountries(query: string): CountryRecord[] {
  const q = query.toLowerCase();
  return REGISTRY.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.genres.some(g => g.includes(q)) ||
    c.languages.some(l => l.includes(q))
  );
}
