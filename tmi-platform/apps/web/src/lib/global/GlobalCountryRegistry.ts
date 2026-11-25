/**
 * Canonical country / territory registry for TMI identity surfaces.
 * Country selection and preferred language remain independent fields.
 * Flag rendering currently uses verified emoji glyphs until owner-supplied
 * flag graphics are imported (MISSING SOURCE — do not fabricate SVG/PNG packs).
 */

export type CountryRegion =
  | "africa"
  | "americas"
  | "asia"
  | "europe"
  | "oceania"
  | "caribbean";

export interface CountryRecord {
  countryCode: string;
  name: string;
  /** Emoji glyph fallback until real flag graphics are registered. */
  flag: string;
  /** Optional path to a real flag graphic under /public once imported. */
  flagImageUrl?: string;
  aliases: string[];
  languages: string[];
  primaryGenre: string;
  genres: string[];
  capital: string;
  region: CountryRegion;
  translationAvailable: boolean;
  captionAvailable: boolean;
  hasHub: boolean;
}

function flagFromCode(code: string): string {
  const cc = code.toUpperCase();
  if (cc.length !== 2) return "🌐";
  const A = 0x1f1e6;
  return String.fromCodePoint(
    A + (cc.charCodeAt(0) - 65),
    A + (cc.charCodeAt(1) - 65),
  );
}

type Seed = {
  code: string;
  name: string;
  aliases?: string[];
  languages?: string[];
  region: CountryRegion;
  primaryGenre?: string;
  genres?: string[];
  capital?: string;
  hub?: boolean;
  translation?: boolean;
  caption?: boolean;
  flagImageUrl?: string;
};

const SEEDS: Seed[] = [
  // Hub / previously registered markets
  { code: "US", name: "United States", aliases: ["USA", "America", "United States of America"], languages: ["en"], region: "americas", primaryGenre: "Hip-Hop", genres: ["hip-hop", "r&b", "country", "trap", "gospel"], capital: "Washington D.C.", hub: true, translation: true, caption: true },
  { code: "CA", name: "Canada", aliases: ["CAN"], languages: ["en", "fr"], region: "americas", primaryGenre: "Hip-Hop", genres: ["hip-hop", "r&b", "pop", "electronic"], capital: "Ottawa", hub: true, translation: true, caption: true },
  { code: "MX", name: "Mexico", aliases: ["México", "MEX"], languages: ["es"], region: "americas", primaryGenre: "Regional Mexican", genres: ["regional-mexican", "latin-trap", "cumbia"], capital: "Mexico City", hub: true, translation: true, caption: true },
  { code: "GB", name: "United Kingdom", aliases: ["UK", "Britain", "Great Britain", "England", "Scotland", "Wales"], languages: ["en"], region: "europe", primaryGenre: "Grime", genres: ["grime", "uk-drill", "garage", "jungle", "dnb"], capital: "London", hub: true, translation: true, caption: true },
  { code: "NG", name: "Nigeria", aliases: ["Naija"], languages: ["en", "yo", "ig", "ha"], region: "africa", primaryGenre: "Afrobeats", genres: ["afrobeats", "afropop", "highlife", "fuji"], capital: "Abuja", hub: true, translation: true, caption: true },
  { code: "JP", name: "Japan", aliases: ["Nippon"], languages: ["ja"], region: "asia", primaryGenre: "J-Hip-Hop", genres: ["j-hiphop", "city-pop", "jpop", "visual-kei"], capital: "Tokyo", hub: true, translation: true, caption: true },
  { code: "BR", name: "Brazil", aliases: ["Brasil"], languages: ["pt"], region: "americas", primaryGenre: "Funk Carioca", genres: ["funk", "samba", "forró", "bossa-nova", "axé"], capital: "Brasília", hub: true, translation: true, caption: true },
  { code: "JM", name: "Jamaica", aliases: [], languages: ["en", "pat"], region: "caribbean", primaryGenre: "Dancehall", genres: ["dancehall", "reggae", "roots", "dub"], capital: "Kingston", hub: true, translation: true, caption: true },
  { code: "PH", name: "Philippines", aliases: ["PHL", "Pilipinas"], languages: ["en", "fil", "tl"], region: "asia", primaryGenre: "OPM", genres: ["opm", "p-pop", "hip-hop"], capital: "Manila", hub: true, translation: true, caption: true },
  { code: "DE", name: "Germany", aliases: ["Deutschland"], languages: ["de"], region: "europe", primaryGenre: "Deutschrap", genres: ["deutschrap", "techno", "house"], capital: "Berlin", hub: true, translation: true, caption: true },
  { code: "FR", name: "France", aliases: [], languages: ["fr"], region: "europe", primaryGenre: "French Rap", genres: ["french-rap", "chanson", "electro", "house"], capital: "Paris", hub: true, translation: true, caption: true },
  { code: "IN", name: "India", aliases: ["Bharat"], languages: ["hi", "pa", "en", "ta"], region: "asia", primaryGenre: "Desi Hip-Hop", genres: ["desi-hiphop", "bhangra", "filmi", "indie"], capital: "New Delhi", hub: true, translation: true, caption: true },
  { code: "ZA", name: "South Africa", aliases: ["RSA"], languages: ["en", "zu", "xh", "af"], region: "africa", primaryGenre: "Amapiano", genres: ["amapiano", "kwaito", "afrohouse", "maskandi"], capital: "Pretoria", hub: true, translation: true, caption: true },
  { code: "GH", name: "Ghana", aliases: [], languages: ["en", "tw", "ga"], region: "africa", primaryGenre: "Highlife", genres: ["highlife", "hiplife", "afropop", "gospel"], capital: "Accra", hub: true, translation: true, caption: false },
  { code: "PR", name: "Puerto Rico", aliases: [], languages: ["es", "en"], region: "caribbean", primaryGenre: "Reggaeton", genres: ["reggaeton", "latin-trap", "salsa"], capital: "San Juan", hub: true, translation: true, caption: true },
  { code: "DO", name: "Dominican Republic", aliases: ["DR", "República Dominicana"], languages: ["es"], region: "caribbean", primaryGenre: "Dembow", genres: ["dembow", "bachata", "merengue"], capital: "Santo Domingo", hub: true, translation: true, caption: true },
  { code: "KR", name: "South Korea", aliases: ["Korea", "ROK", "Hanguk"], languages: ["ko"], region: "asia", primaryGenre: "K-Hip-Hop", genres: ["k-hiphop", "kpop", "indie", "trot"], capital: "Seoul", hub: true, translation: true, caption: true },
  { code: "TT", name: "Trinidad and Tobago", aliases: ["Trinidad"], languages: ["en", "cr"], region: "caribbean", primaryGenre: "Soca", genres: ["soca", "calypso", "chutney", "dancehall"], capital: "Port of Spain", hub: true, translation: true, caption: false },
  { code: "CO", name: "Colombia", aliases: [], languages: ["es"], region: "americas", primaryGenre: "Reggaeton", genres: ["reggaeton", "vallenato", "cumbia", "latin-trap"], capital: "Bogotá", hub: true, translation: true, caption: true },

  // Expanded global catalog (searchable; hub false until market launch)
  { code: "AF", name: "Afghanistan", region: "asia", languages: ["ps", "fa"] },
  { code: "AL", name: "Albania", region: "europe", languages: ["sq"] },
  { code: "DZ", name: "Algeria", region: "africa", languages: ["ar", "fr"] },
  { code: "AR", name: "Argentina", region: "americas", languages: ["es"], aliases: ["ARG"] },
  { code: "AM", name: "Armenia", region: "asia", languages: ["hy"] },
  { code: "AU", name: "Australia", region: "oceania", languages: ["en"], aliases: ["AUS"] },
  { code: "AT", name: "Austria", region: "europe", languages: ["de"] },
  { code: "AZ", name: "Azerbaijan", region: "asia", languages: ["az"] },
  { code: "BS", name: "Bahamas", region: "caribbean", languages: ["en"] },
  { code: "BH", name: "Bahrain", region: "asia", languages: ["ar"] },
  { code: "BD", name: "Bangladesh", region: "asia", languages: ["bn"] },
  { code: "BB", name: "Barbados", region: "caribbean", languages: ["en"] },
  { code: "BY", name: "Belarus", region: "europe", languages: ["be", "ru"] },
  { code: "BE", name: "Belgium", region: "europe", languages: ["nl", "fr", "de"] },
  { code: "BZ", name: "Belize", region: "americas", languages: ["en"] },
  { code: "BJ", name: "Benin", region: "africa", languages: ["fr"] },
  { code: "BM", name: "Bermuda", region: "americas", languages: ["en"] },
  { code: "BO", name: "Bolivia", region: "americas", languages: ["es"] },
  { code: "BA", name: "Bosnia and Herzegovina", region: "europe", languages: ["bs", "hr", "sr"], aliases: ["Bosnia"] },
  { code: "BW", name: "Botswana", region: "africa", languages: ["en", "tn"] },
  { code: "BN", name: "Brunei", region: "asia", languages: ["ms"] },
  { code: "BG", name: "Bulgaria", region: "europe", languages: ["bg"] },
  { code: "BF", name: "Burkina Faso", region: "africa", languages: ["fr"] },
  { code: "BI", name: "Burundi", region: "africa", languages: ["fr", "rn"] },
  { code: "KH", name: "Cambodia", region: "asia", languages: ["km"] },
  { code: "CM", name: "Cameroon", region: "africa", languages: ["fr", "en"] },
  { code: "CV", name: "Cape Verde", region: "africa", languages: ["pt"], aliases: ["Cabo Verde"] },
  { code: "KY", name: "Cayman Islands", region: "caribbean", languages: ["en"] },
  { code: "CF", name: "Central African Republic", region: "africa", languages: ["fr"] },
  { code: "TD", name: "Chad", region: "africa", languages: ["fr", "ar"] },
  { code: "CL", name: "Chile", region: "americas", languages: ["es"] },
  { code: "CN", name: "China", region: "asia", languages: ["zh"], aliases: ["PRC"] },
  { code: "CD", name: "Congo (DRC)", region: "africa", languages: ["fr"], aliases: ["DRC", "Congo-Kinshasa", "Democratic Republic of the Congo"] },
  { code: "CG", name: "Congo (Republic)", region: "africa", languages: ["fr"], aliases: ["Congo-Brazzaville"] },
  { code: "CR", name: "Costa Rica", region: "americas", languages: ["es"] },
  { code: "CI", name: "Côte d'Ivoire", region: "africa", languages: ["fr"], aliases: ["Ivory Coast", "Cote d'Ivoire"] },
  { code: "HR", name: "Croatia", region: "europe", languages: ["hr"] },
  { code: "CU", name: "Cuba", region: "caribbean", languages: ["es"] },
  { code: "CW", name: "Curaçao", region: "caribbean", languages: ["nl", "en", "pap"], aliases: ["Curacao"] },
  { code: "CY", name: "Cyprus", region: "europe", languages: ["el", "tr"] },
  { code: "CZ", name: "Czechia", region: "europe", languages: ["cs"], aliases: ["Czech Republic"] },
  { code: "DK", name: "Denmark", region: "europe", languages: ["da"] },
  { code: "DJ", name: "Djibouti", region: "africa", languages: ["fr", "ar"] },
  { code: "DM", name: "Dominica", region: "caribbean", languages: ["en"] },
  { code: "EC", name: "Ecuador", region: "americas", languages: ["es"] },
  { code: "EG", name: "Egypt", region: "africa", languages: ["ar"] },
  { code: "SV", name: "El Salvador", region: "americas", languages: ["es"] },
  { code: "SZ", name: "Eswatini", region: "africa", languages: ["en", "ss"], aliases: ["Swaziland"] },
  { code: "EE", name: "Estonia", region: "europe", languages: ["et"] },
  { code: "ET", name: "Ethiopia", region: "africa", languages: ["am"] },
  { code: "FJ", name: "Fiji", region: "oceania", languages: ["en"] },
  { code: "FI", name: "Finland", region: "europe", languages: ["fi", "sv"] },
  { code: "GA", name: "Gabon", region: "africa", languages: ["fr"] },
  { code: "GM", name: "Gambia", region: "africa", languages: ["en"] },
  { code: "GE", name: "Georgia", region: "asia", languages: ["ka"] },
  { code: "GR", name: "Greece", region: "europe", languages: ["el"] },
  { code: "GD", name: "Grenada", region: "caribbean", languages: ["en"] },
  { code: "GT", name: "Guatemala", region: "americas", languages: ["es"] },
  { code: "GN", name: "Guinea", region: "africa", languages: ["fr"] },
  { code: "GY", name: "Guyana", region: "americas", languages: ["en"] },
  { code: "HT", name: "Haiti", region: "caribbean", languages: ["ht", "fr"] },
  { code: "HN", name: "Honduras", region: "americas", languages: ["es"] },
  { code: "HK", name: "Hong Kong", region: "asia", languages: ["zh", "en"] },
  { code: "HU", name: "Hungary", region: "europe", languages: ["hu"] },
  { code: "IS", name: "Iceland", region: "europe", languages: ["is"] },
  { code: "ID", name: "Indonesia", region: "asia", languages: ["id"] },
  { code: "IR", name: "Iran", region: "asia", languages: ["fa"] },
  { code: "IQ", name: "Iraq", region: "asia", languages: ["ar", "ku"] },
  { code: "IE", name: "Ireland", region: "europe", languages: ["en", "ga"], aliases: ["Eire", "Republic of Ireland"] },
  { code: "IL", name: "Israel", region: "asia", languages: ["he", "ar"] },
  { code: "IT", name: "Italy", region: "europe", languages: ["it"] },
  { code: "JO", name: "Jordan", region: "asia", languages: ["ar"] },
  { code: "KZ", name: "Kazakhstan", region: "asia", languages: ["kk", "ru"] },
  { code: "KE", name: "Kenya", region: "africa", languages: ["en", "sw"] },
  { code: "KW", name: "Kuwait", region: "asia", languages: ["ar"] },
  { code: "KG", name: "Kyrgyzstan", region: "asia", languages: ["ky", "ru"] },
  { code: "LA", name: "Laos", region: "asia", languages: ["lo"] },
  { code: "LV", name: "Latvia", region: "europe", languages: ["lv"] },
  { code: "LB", name: "Lebanon", region: "asia", languages: ["ar"] },
  { code: "LR", name: "Liberia", region: "africa", languages: ["en"] },
  { code: "LY", name: "Libya", region: "africa", languages: ["ar"] },
  { code: "LT", name: "Lithuania", region: "europe", languages: ["lt"] },
  { code: "LU", name: "Luxembourg", region: "europe", languages: ["fr", "de", "lb"] },
  { code: "MO", name: "Macao", region: "asia", languages: ["zh", "pt"], aliases: ["Macau"] },
  { code: "MG", name: "Madagascar", region: "africa", languages: ["mg", "fr"] },
  { code: "MW", name: "Malawi", region: "africa", languages: ["en"] },
  { code: "MY", name: "Malaysia", region: "asia", languages: ["ms", "en"] },
  { code: "MV", name: "Maldives", region: "asia", languages: ["dv"] },
  { code: "ML", name: "Mali", region: "africa", languages: ["fr"] },
  { code: "MT", name: "Malta", region: "europe", languages: ["mt", "en"] },
  { code: "MQ", name: "Martinique", region: "caribbean", languages: ["fr"] },
  { code: "MR", name: "Mauritania", region: "africa", languages: ["ar"] },
  { code: "MU", name: "Mauritius", region: "africa", languages: ["en", "fr"] },
  { code: "MD", name: "Moldova", region: "europe", languages: ["ro"] },
  { code: "MC", name: "Monaco", region: "europe", languages: ["fr"] },
  { code: "MN", name: "Mongolia", region: "asia", languages: ["mn"] },
  { code: "ME", name: "Montenegro", region: "europe", languages: ["sr"] },
  { code: "MA", name: "Morocco", region: "africa", languages: ["ar", "fr"] },
  { code: "MZ", name: "Mozambique", region: "africa", languages: ["pt"] },
  { code: "MM", name: "Myanmar", region: "asia", languages: ["my"], aliases: ["Burma"] },
  { code: "NA", name: "Namibia", region: "africa", languages: ["en"] },
  { code: "NP", name: "Nepal", region: "asia", languages: ["ne"] },
  { code: "NL", name: "Netherlands", region: "europe", languages: ["nl"], aliases: ["Holland"] },
  { code: "NZ", name: "New Zealand", region: "oceania", languages: ["en", "mi"], aliases: ["Aotearoa"] },
  { code: "NI", name: "Nicaragua", region: "americas", languages: ["es"] },
  { code: "NE", name: "Niger", region: "africa", languages: ["fr"] },
  { code: "MK", name: "North Macedonia", region: "europe", languages: ["mk"], aliases: ["Macedonia"] },
  { code: "NO", name: "Norway", region: "europe", languages: ["no"] },
  { code: "OM", name: "Oman", region: "asia", languages: ["ar"] },
  { code: "PK", name: "Pakistan", region: "asia", languages: ["ur", "en"] },
  { code: "PS", name: "Palestine", region: "asia", languages: ["ar"] },
  { code: "PA", name: "Panama", region: "americas", languages: ["es"] },
  { code: "PG", name: "Papua New Guinea", region: "oceania", languages: ["en"] },
  { code: "PY", name: "Paraguay", region: "americas", languages: ["es", "gn"] },
  { code: "PE", name: "Peru", region: "americas", languages: ["es"] },
  { code: "PL", name: "Poland", region: "europe", languages: ["pl"] },
  { code: "PT", name: "Portugal", region: "europe", languages: ["pt"] },
  { code: "QA", name: "Qatar", region: "asia", languages: ["ar"] },
  { code: "RE", name: "Réunion", region: "africa", languages: ["fr"], aliases: ["Reunion"] },
  { code: "RO", name: "Romania", region: "europe", languages: ["ro"] },
  { code: "RU", name: "Russia", region: "europe", languages: ["ru"], aliases: ["Russian Federation"] },
  { code: "RW", name: "Rwanda", region: "africa", languages: ["rw", "en", "fr"] },
  { code: "KN", name: "Saint Kitts and Nevis", region: "caribbean", languages: ["en"] },
  { code: "LC", name: "Saint Lucia", region: "caribbean", languages: ["en"] },
  { code: "VC", name: "Saint Vincent and the Grenadines", region: "caribbean", languages: ["en"], aliases: ["St Vincent"] },
  { code: "WS", name: "Samoa", region: "oceania", languages: ["sm", "en"] },
  { code: "SA", name: "Saudi Arabia", region: "asia", languages: ["ar"], aliases: ["KSA"] },
  { code: "SN", name: "Senegal", region: "africa", languages: ["fr"] },
  { code: "RS", name: "Serbia", region: "europe", languages: ["sr"] },
  { code: "SC", name: "Seychelles", region: "africa", languages: ["en", "fr"] },
  { code: "SL", name: "Sierra Leone", region: "africa", languages: ["en"] },
  { code: "SG", name: "Singapore", region: "asia", languages: ["en", "zh", "ms", "ta"] },
  { code: "SK", name: "Slovakia", region: "europe", languages: ["sk"] },
  { code: "SI", name: "Slovenia", region: "europe", languages: ["sl"] },
  { code: "SB", name: "Solomon Islands", region: "oceania", languages: ["en"] },
  { code: "SO", name: "Somalia", region: "africa", languages: ["so", "ar"] },
  { code: "SS", name: "South Sudan", region: "africa", languages: ["en"] },
  { code: "ES", name: "Spain", region: "europe", languages: ["es"], aliases: ["España", "Espana"] },
  { code: "LK", name: "Sri Lanka", region: "asia", languages: ["si", "ta"] },
  { code: "SD", name: "Sudan", region: "africa", languages: ["ar", "en"] },
  { code: "SR", name: "Suriname", region: "americas", languages: ["nl"] },
  { code: "SE", name: "Sweden", region: "europe", languages: ["sv"] },
  { code: "CH", name: "Switzerland", region: "europe", languages: ["de", "fr", "it"] },
  { code: "SY", name: "Syria", region: "asia", languages: ["ar"] },
  { code: "TW", name: "Taiwan", region: "asia", languages: ["zh"] },
  { code: "TJ", name: "Tajikistan", region: "asia", languages: ["tg", "ru"] },
  { code: "TZ", name: "Tanzania", region: "africa", languages: ["sw", "en"] },
  { code: "TH", name: "Thailand", region: "asia", languages: ["th"] },
  { code: "TL", name: "Timor-Leste", region: "asia", languages: ["pt", "tet"], aliases: ["East Timor"] },
  { code: "TG", name: "Togo", region: "africa", languages: ["fr"] },
  { code: "TO", name: "Tonga", region: "oceania", languages: ["to", "en"] },
  { code: "TN", name: "Tunisia", region: "africa", languages: ["ar", "fr"] },
  { code: "TR", name: "Türkiye", region: "asia", languages: ["tr"], aliases: ["Turkey"] },
  { code: "TM", name: "Turkmenistan", region: "asia", languages: ["tk", "ru"] },
  { code: "TC", name: "Turks and Caicos Islands", region: "caribbean", languages: ["en"] },
  { code: "UG", name: "Uganda", region: "africa", languages: ["en", "sw"] },
  { code: "UA", name: "Ukraine", region: "europe", languages: ["uk"] },
  { code: "AE", name: "United Arab Emirates", region: "asia", languages: ["ar", "en"], aliases: ["UAE", "Emirates"] },
  { code: "UY", name: "Uruguay", region: "americas", languages: ["es"] },
  { code: "UZ", name: "Uzbekistan", region: "asia", languages: ["uz", "ru"] },
  { code: "VU", name: "Vanuatu", region: "oceania", languages: ["bi", "en", "fr"] },
  { code: "VE", name: "Venezuela", region: "americas", languages: ["es"] },
  { code: "VN", name: "Vietnam", region: "asia", languages: ["vi"] },
  { code: "VG", name: "British Virgin Islands", region: "caribbean", languages: ["en"] },
  { code: "VI", name: "U.S. Virgin Islands", region: "caribbean", languages: ["en"], aliases: ["USVI", "Virgin Islands"] },
  { code: "YE", name: "Yemen", region: "asia", languages: ["ar"] },
  { code: "ZM", name: "Zambia", region: "africa", languages: ["en"] },
  { code: "ZW", name: "Zimbabwe", region: "africa", languages: ["en"] },
];

function toRecord(seed: Seed): CountryRecord {
  const code = seed.code.toUpperCase();
  return {
    countryCode: code,
    name: seed.name,
    flag: flagFromCode(code),
    flagImageUrl: seed.flagImageUrl,
    aliases: seed.aliases ?? [],
    languages: seed.languages ?? ["en"],
    primaryGenre: seed.primaryGenre ?? "Global",
    genres: seed.genres ?? ["global"],
    capital: seed.capital ?? "",
    region: seed.region,
    translationAvailable: seed.translation ?? false,
    captionAvailable: seed.caption ?? false,
    hasHub: seed.hub ?? false,
  };
}

const REGISTRY: CountryRecord[] = SEEDS.map(toRecord);

const map = new Map(REGISTRY.map((c) => [c.countryCode, c]));

export function getAllCountries(): CountryRecord[] {
  return REGISTRY.slice().sort((a, b) => a.name.localeCompare(b.name));
}

export function getCountry(countryCode: string): CountryRecord | null {
  if (!countryCode?.trim()) return null;
  return map.get(countryCode.trim().toUpperCase()) ?? null;
}

export function isValidCountryCode(countryCode: string): boolean {
  return getCountry(countryCode) != null;
}

export function getCountriesByRegion(region: CountryRecord["region"]): CountryRecord[] {
  return REGISTRY.filter((c) => c.region === region);
}

export function getHubCountries(): CountryRecord[] {
  return REGISTRY.filter((c) => c.hasHub);
}

/**
 * Instant filter for the searchable flag picker.
 * Matches: display name, aliases (USA/UK/…), ISO alpha-2 code, languages, genres.
 * Does NOT infer a member's preferred language from country.
 */
export function searchCountries(query: string): CountryRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return getAllCountries();

  const codeQ = q.toUpperCase();
  return REGISTRY.filter((c) => {
    if (c.countryCode === codeQ || c.countryCode.toLowerCase().includes(q)) return true;
    if (c.name.toLowerCase().includes(q)) return true;
    if (c.aliases.some((a) => a.toLowerCase().includes(q))) return true;
    if (c.languages.some((l) => l.toLowerCase() === q)) return true;
    if (c.genres.some((g) => g.includes(q))) return true;
    return false;
  }).sort((a, b) => {
    // Prefer exact code / alias hits, then name prefix, then alpha.
    const aExact =
      a.countryCode === codeQ ||
      a.aliases.some((x) => x.toLowerCase() === q) ||
      a.name.toLowerCase() === q
        ? 0
        : a.name.toLowerCase().startsWith(q) || a.countryCode.toLowerCase().startsWith(q)
          ? 1
          : 2;
    const bExact =
      b.countryCode === codeQ ||
      b.aliases.some((x) => x.toLowerCase() === q) ||
      b.name.toLowerCase() === q
        ? 0
        : b.name.toLowerCase().startsWith(q) || b.countryCode.toLowerCase().startsWith(q)
          ? 1
          : 2;
    if (aExact !== bExact) return aExact - bExact;
    return a.name.localeCompare(b.name);
  });
}

export function getFlagVisual(countryCode: string): {
  emoji: string;
  imageUrl: string | null;
  label: string;
  code: string;
} | null {
  const c = getCountry(countryCode);
  if (!c) return null;
  return {
    emoji: c.flag,
    imageUrl: c.flagImageUrl ?? null,
    label: c.name,
    code: c.countryCode,
  };
}
