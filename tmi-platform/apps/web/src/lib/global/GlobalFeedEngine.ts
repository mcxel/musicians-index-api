import { getLiveCountries, getCurrentPeakRegions } from "./GlobalActivityEngine";
import { getGlobalDiscoveryFeed } from "./CultureDiscoveryEngine";

export interface GlobalFeedItem {
  id: string;
  type: "live-show" | "battle" | "artist" | "song" | "article" | "country-spotlight" | "genre-guide";
  title: string;
  subtitle?: string;
  country: string;
  countryCode: string;
  flag: string;
  route: string;
  accentColor?: string;
  isLive?: boolean;
}

export interface GlobalFeedSection {
  sectionId: string;
  label: string;
  icon: string;
  items: GlobalFeedItem[];
}

const ACCENT_MAP: Record<string, string> = {
  US: "#00FFFF", NG: "#00FF88", GB: "#FF2DAA", JM: "#FFD700",
  BR: "#00FF88", KR: "#AA2DFF", ZA: "#FF9500", GH: "#FFD700",
  TT: "#FF2DAA", JP: "#FF6B9D", FR: "#00FFFF", IN: "#FFB347",
  CO: "#00FF88", CA: "#FF2DAA",
};

export function getGlobalNowLiveFeed(): GlobalFeedItem[] {
  const countries = getCurrentPeakRegions().slice(0, 6);
  return countries.map((c, i) => ({
    id: `live-${c.countryCode}-${i}`,
    type: "live-show",
    title: `${c.city} Live Room`,
    subtitle: `${c.activeRooms} rooms • ${c.activeFans} watching`,
    country: c.country,
    countryCode: c.countryCode,
    flag: getFlagEmoji(c.countryCode),
    route: `/global/${c.countryCode.toLowerCase()}`,
    accentColor: ACCENT_MAP[c.countryCode] ?? "#00FFFF",
    isLive: true,
  }));
}

export function getWorldTrendingFeed(): GlobalFeedItem[] {
  const feed = getGlobalDiscoveryFeed();
  return feed.trendingSongs.map((s, i) => ({
    id: `trending-${i}`,
    type: "song",
    title: s.title,
    subtitle: s.artist,
    country: s.country,
    countryCode: "XX",
    flag: s.flag,
    route: `/beats`,
    accentColor: "#AA2DFF",
  }));
}

export function getLiveAcrossTheWorldFeed(): GlobalFeedSection[] {
  const countries = getLiveCountries().slice(0, 8);
  return [
    {
      sectionId: "global-now-live",
      label: "Global Now Live",
      icon: "🌍",
      items: getGlobalNowLiveFeed(),
    },
    {
      sectionId: "world-trending",
      label: "World Trending",
      icon: "📈",
      items: getWorldTrendingFeed(),
    },
    {
      sectionId: "live-across-world",
      label: "Live Across The World",
      icon: "🎙️",
      items: countries.map((c, i) => ({
        id: `world-${c.countryCode}-${i}`,
        type: "live-show" as const,
        title: `${c.country} — ${c.activeRooms} Rooms Live`,
        subtitle: `${c.activeArtists} artists • ${c.activeVenues} venues`,
        country: c.country,
        countryCode: c.countryCode,
        flag: getFlagEmoji(c.countryCode),
        route: `/global/${c.countryCode.toLowerCase()}`,
        accentColor: ACCENT_MAP[c.countryCode] ?? "#00FFFF",
        isLive: true,
      })),
    },
  ];
}

export function getDiscoverNewMusicFeed(excludeCountryCode = "US"): GlobalFeedItem[] {
  const feed = getGlobalDiscoveryFeed();
  return feed.spotlights
    .filter(s => s.countryCode !== excludeCountryCode)
    .map(s => ({
      id: `discover-${s.countryCode}`,
      type: "country-spotlight" as const,
      title: `Discover ${s.genre}`,
      subtitle: s.description,
      country: s.country,
      countryCode: s.countryCode,
      flag: s.flag,
      route: `/global/${s.countryCode.toLowerCase()}`,
      accentColor: ACCENT_MAP[s.countryCode] ?? "#00FFFF",
    }));
}

function getFlagEmoji(countryCode: string): string {
  const FLAGS: Record<string, string> = {
    US: "🇺🇸", NG: "🇳🇬", GB: "🇬🇧", JM: "🇯🇲", BR: "🇧🇷", KR: "🇰🇷",
    ZA: "🇿🇦", GH: "🇬🇭", TT: "🇹🇹", JP: "🇯🇵", FR: "🇫🇷", IN: "🇮🇳",
    CO: "🇨🇴", CA: "🇨🇦",
  };
  return FLAGS[countryCode] ?? "🌐";
}
