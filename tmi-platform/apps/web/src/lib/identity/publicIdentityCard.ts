/**
 * Public identity card links. Only owner-saved destinations.
 * A missing service is absent. Names are never turned into profiles.
 */

export type CardShelf = "MUSIC" | "SOCIAL" | "BUSINESS" | "TMI";

export interface PublicCardLink {
  id: string;
  label: string;
  href: string;
  shelf: CardShelf;
}

interface ServiceRule {
  id: string;
  keys: string[];
  label: string;
  shelf: CardShelf;
  hosts: string[] | "*";
  handlePrefix?: string;
}

const SERVICES: ServiceRule[] = [
  { id: "spotify", keys: ["spotify"], label: "Spotify", shelf: "MUSIC", hosts: ["open.spotify.com", "spotify.com"] },
  { id: "apple-music", keys: ["applemusic", "apple_music", "appleMusic"], label: "Apple Music", shelf: "MUSIC", hosts: ["music.apple.com"] },
  { id: "youtube-music", keys: ["youtubemusic", "youtube_music", "youtubeMusic"], label: "YouTube Music", shelf: "MUSIC", hosts: ["music.youtube.com"] },
  { id: "soundcloud", keys: ["soundcloud"], label: "SoundCloud", shelf: "MUSIC", hosts: ["soundcloud.com"], handlePrefix: "https://soundcloud.com/" },
  { id: "bandcamp", keys: ["bandcamp"], label: "Bandcamp", shelf: "MUSIC", hosts: ["bandcamp.com"] },
  { id: "youtube", keys: ["youtube"], label: "YouTube", shelf: "SOCIAL", hosts: ["youtube.com", "youtu.be", "m.youtube.com", "music.youtube.com"], handlePrefix: "https://www.youtube.com/@" },
  { id: "instagram", keys: ["instagram"], label: "Instagram", shelf: "SOCIAL", hosts: ["instagram.com"], handlePrefix: "https://www.instagram.com/" },
  { id: "tiktok", keys: ["tiktok"], label: "TikTok", shelf: "SOCIAL", hosts: ["tiktok.com"], handlePrefix: "https://www.tiktok.com/@" },
  { id: "facebook", keys: ["facebook"], label: "Facebook", shelf: "SOCIAL", hosts: ["facebook.com", "fb.watch"], handlePrefix: "https://www.facebook.com/" },
  { id: "x", keys: ["twitter", "x"], label: "X", shelf: "SOCIAL", hosts: ["twitter.com", "x.com"], handlePrefix: "https://x.com/" },
  { id: "twitch", keys: ["twitch"], label: "Twitch", shelf: "SOCIAL", hosts: ["twitch.tv"], handlePrefix: "https://www.twitch.tv/" },
  { id: "snapchat", keys: ["snapchat"], label: "Snapchat", shelf: "SOCIAL", hosts: ["snapchat.com"], handlePrefix: "https://www.snapchat.com/add/" },
  { id: "website", keys: ["website", "site"], label: "Website", shelf: "BUSINESS", hosts: "*" },
  { id: "merch", keys: ["store", "merch"], label: "Merch", shelf: "BUSINESS", hosts: "*" },
  { id: "booking", keys: ["booking"], label: "Booking", shelf: "BUSINESS", hosts: "*" },
];

function hostOf(url: URL): string {
  return url.hostname.replace(/^www\./, "").toLowerCase();
}

/** https only. No scripts, credentials, or private-app routes. */
export function safePublicUrl(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 400) return null;
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return null;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  if (url.username || url.password) return null;
  if (url.pathname.includes("..")) return null;
  const host = hostOf(url);
  if (!host || host === "localhost" || host.endsWith(".local")) return null;
  const tmi = host === "themusiciansindex.com" || host.endsWith(".themusiciansindex.com");
  if (tmi && /^\/(hub|auth|api|settings|admin)(\/|$)/.test(url.pathname)) return null;
  return url;
}

function handleToken(raw: string): string | null {
  const value = raw.trim().replace(/^@/, "");
  if (!value || value.length > 80 || /\s/.test(value) || value.includes("://")) return null;
  if (!/^[A-Za-z0-9._/-]+$/.test(value)) return null;
  return value;
}

function hostAllowed(url: URL, hosts: string[] | "*"): boolean {
  if (hosts === "*") return true;
  const host = hostOf(url);
  return hosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
}

function readValue(record: Record<string, unknown>, keys: string[]): string {
  const lowered = new Map(Object.entries(record).map(([key, value]) => [key.toLowerCase(), value]));
  for (const key of keys) {
    const value = lowered.get(key.toLowerCase());
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

/** Owner-saved public destinations. Empty services stay off the card. */
export function collectPublicCardLinks(source: Record<string, unknown> | null | undefined): PublicCardLink[] {
  if (!source) return [];
  const links: PublicCardLink[] = [];
  for (const service of SERVICES) {
    const raw = readValue(source, service.keys);
    if (!raw) continue;
    const parsed = safePublicUrl(raw);
    if (parsed && hostAllowed(parsed, service.hosts)) {
      links.push({ id: service.id, label: service.label, href: parsed.toString(), shelf: service.shelf });
      continue;
    }
    if (!service.handlePrefix || service.hosts === "*") continue;
    const handle = handleToken(raw);
    if (!handle) continue;
    const built = safePublicUrl(`${service.handlePrefix}${handle}`);
    if (built && hostAllowed(built, service.hosts)) {
      links.push({ id: service.id, label: service.label, href: built.toString(), shelf: service.shelf });
    }
  }
  return links;
}

const FAN_CARD_IDS = new Set(["youtube", "instagram", "tiktok", "facebook", "x", "twitch", "snapchat", "website"]);

/** One card. Role only changes which saved destinations are allowed to show. */
export function cardLinksForMember(
  source: Record<string, unknown> | null | undefined,
  kind: "fan" | "performer",
): PublicCardLink[] {
  const links = collectPublicCardLinks(source);
  if (kind === "performer") return links;
  return links.filter((link) => FAN_CARD_IDS.has(link.id));
}

export function readCardTokens(source: Record<string, unknown> | null | undefined, key: "_cardOrder" | "_cardHidden"): string[] {
  const raw = source?.[key];
  if (typeof raw !== "string") return [];
  return raw.split(",").map((token) => token.trim()).filter(Boolean);
}

/** Saved order and hide list live in the existing socialLinks JSON. */
export function presentCardLinks(
  links: PublicCardLink[],
  source: Record<string, unknown> | null | undefined,
): PublicCardLink[] {
  const hidden = new Set(readCardTokens(source, "_cardHidden"));
  const order = readCardTokens(source, "_cardOrder");
  const rank = new Map(order.map((id, index) => [id, index]));
  return links
    .filter((link) => !hidden.has(link.id))
    .map((link, index) => ({ link, index }))
    .sort((left, right) => {
      const leftRank = rank.get(left.link.id);
      const rightRank = rank.get(right.link.id);
      if (leftRank !== undefined && rightRank !== undefined) return leftRank - rightRank;
      if (leftRank !== undefined) return -1;
      if (rightRank !== undefined) return 1;
      return left.index - right.index;
    })
    .map((entry) => entry.link);
}

export const CARD_LINK_IDS = [...SERVICES.map((service) => service.id), "article"];
