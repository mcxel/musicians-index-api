import { SEO_BRAND } from "./SeoBrandConfig";

export interface CityMusicScene {
  city: string;
  slug: string;
  state: string;
  stateCode: string;
  region: string;
  dominantGenre: string;
  genres: string[];
  activeArtists: number;
  activeVenues: number;
  activeBattles: number;
  description: string;
  canonicalUrl: string;
  keywords: string[];
}

const CITY_SCENES: CityMusicScene[] = [
  {
    city: "Atlanta", slug: "atlanta", state: "Georgia", stateCode: "GA", region: "South",
    dominantGenre: "Hip-Hop / Trap",
    genres: ["hip-hop", "trap", "r&b", "gospel"],
    activeArtists: 42, activeVenues: 12, activeBattles: 8,
    description: "Atlanta is the birthplace of trap music and home to the most active battle rap scene on TMI. Discover independent artists, live venues, and weekly cyphers from the ATL.",
    canonicalUrl: `${SEO_BRAND.ROOT_CANONICAL}/cities/atlanta`,
    keywords: ["Atlanta rap", "Atlanta hip-hop", "Atlanta trap artists", "ATL rappers", "Atlanta music scene", "Atlanta battles"],
  },
  {
    city: "Los Angeles", slug: "los-angeles", state: "California", stateCode: "CA", region: "West Coast",
    dominantGenre: "West Coast Hip-Hop",
    genres: ["hip-hop", "r&b", "pop", "reggaeton", "latin"],
    activeArtists: 58, activeVenues: 18, activeBattles: 11,
    description: "Los Angeles is the entertainment capital of the world. Explore independent rap, R&B, and pop artists from LA competing and performing on TMI.",
    canonicalUrl: `${SEO_BRAND.ROOT_CANONICAL}/cities/los-angeles`,
    keywords: ["LA rappers", "Los Angeles hip-hop", "LA music scene", "West Coast rap", "LA independent artists"],
  },
  {
    city: "Houston", slug: "houston", state: "Texas", stateCode: "TX", region: "South",
    dominantGenre: "Screwed & Chopped / Trap",
    genres: ["hip-hop", "trap", "chopped-and-screwed", "r&b"],
    activeArtists: 35, activeVenues: 9, activeBattles: 6,
    description: "Houston's screwed and chopped legacy and trap scene power the most consistent weekly cypher activity on TMI from the Lone Star State.",
    canonicalUrl: `${SEO_BRAND.ROOT_CANONICAL}/cities/houston`,
    keywords: ["Houston rap", "Houston hip-hop", "Texas music", "Houston trap artists", "H-Town rappers"],
  },
  {
    city: "New York", slug: "new-york", state: "New York", stateCode: "NY", region: "East Coast",
    dominantGenre: "East Coast Hip-Hop / Drill",
    genres: ["hip-hop", "drill", "afrobeats", "r&b"],
    activeArtists: 64, activeVenues: 22, activeBattles: 15,
    description: "New York is the birthplace of hip-hop. TMI's NY scene is the most active in the country — battles, cyphers, and live shows running every week.",
    canonicalUrl: `${SEO_BRAND.ROOT_CANONICAL}/cities/new-york`,
    keywords: ["NYC rappers", "New York hip-hop", "NY drill", "East Coast rap", "Brooklyn artists", "Bronx rappers"],
  },
  {
    city: "Chicago", slug: "chicago", state: "Illinois", stateCode: "IL", region: "Midwest",
    dominantGenre: "Drill",
    genres: ["drill", "hip-hop", "r&b", "gospel"],
    activeArtists: 29, activeVenues: 8, activeBattles: 7,
    description: "Chicago drill put the Midwest on the global map. Find independent artists, venues, and battles from the Chi on TMI.",
    canonicalUrl: `${SEO_BRAND.ROOT_CANONICAL}/cities/chicago`,
    keywords: ["Chicago drill", "Chicago rappers", "Chi-town hip-hop", "Chicago music scene", "Chicago drill artists"],
  },
  {
    city: "Nashville", slug: "nashville", state: "Tennessee", stateCode: "TN", region: "South",
    dominantGenre: "Country / Hip-Hop",
    genres: ["country", "hip-hop", "r&b", "rock"],
    activeArtists: 22, activeVenues: 7, activeBattles: 3,
    description: "Nashville is the country music capital but its hip-hop and R&B scene is rising fast. Discover crossover artists performing and competing on TMI.",
    canonicalUrl: `${SEO_BRAND.ROOT_CANONICAL}/cities/nashville`,
    keywords: ["Nashville music", "Nashville hip-hop", "Nashville country artists", "Nashville independent artists"],
  },
  {
    city: "Miami", slug: "miami", state: "Florida", stateCode: "FL", region: "South",
    dominantGenre: "Latin / Electronic",
    genres: ["latin", "reggaeton", "electronic", "hip-hop"],
    activeArtists: 31, activeVenues: 11, activeBattles: 5,
    description: "Miami's Latin and electronic music scene is one of the most vibrant in TMI's network. Bilingual artists, reggaeton, and EDM acts compete weekly.",
    canonicalUrl: `${SEO_BRAND.ROOT_CANONICAL}/cities/miami`,
    keywords: ["Miami music", "Miami Latin artists", "Miami reggaeton", "Miami hip-hop", "South Florida rappers"],
  },
  {
    city: "Detroit", slug: "detroit", state: "Michigan", stateCode: "MI", region: "Midwest",
    dominantGenre: "Hip-Hop / R&B",
    genres: ["hip-hop", "r&b", "electronic", "gospel"],
    activeArtists: 19, activeVenues: 5, activeBattles: 4,
    description: "Detroit's legacy in hip-hop and Motown soul runs deep. TMI connects Detroit's independent artists to the world.",
    canonicalUrl: `${SEO_BRAND.ROOT_CANONICAL}/cities/detroit`,
    keywords: ["Detroit rappers", "Detroit hip-hop", "Michigan artists", "Detroit music scene"],
  },
];

export function getCityScene(slug: string): CityMusicScene | null {
  return CITY_SCENES.find(c => c.slug === slug.toLowerCase()) ?? null;
}

export function getAllCityScenes(): CityMusicScene[] {
  return CITY_SCENES;
}

export function getCityScenesByState(stateCode: string): CityMusicScene[] {
  return CITY_SCENES.filter(c => c.stateCode === stateCode.toUpperCase());
}

export function getCityScenesByRegion(region: string): CityMusicScene[] {
  return CITY_SCENES.filter(c => c.region.toLowerCase() === region.toLowerCase());
}

export function generateCityMetaTitle(city: CityMusicScene): string {
  return `${city.city} Music Scene — Independent Artists, Venues & Battles | ${SEO_BRAND.PRODUCT_NAME}`;
}

export function generateCityMetaDescription(city: CityMusicScene): string {
  return `Discover ${city.dominantGenre} artists from ${city.city}. ${city.activeArtists} artists, ${city.activeVenues} venues, and ${city.activeBattles} active battles on ${SEO_BRAND.PRODUCT_NAME}.`;
}
