/**
 * GPS destination release states. Friends stays held while the accepted-list query is unavailable.
 * Presentation only. HIDDEN and COMING_SOON do not delete an authority.
 * OPEN is a temporary badge on a LIVE destination, not a fourth capability.
 */

export type GpsReleaseState = "LIVE" | "COMING_SOON" | "HIDDEN";
export type GpsReleaseGroup = "GUIDE" | "SOCIAL" | "CREATE" | "LIVE" | "MEDIA" | "COMMERCE" | "ACCOUNT";
export type GpsReleaseRole = "fan" | "performer";

export interface GpsReleaseDestination {
  id: string;
  label: string;
  group: GpsReleaseGroup;
  state: GpsReleaseState;
  openBadge: boolean;
  roles?: GpsReleaseRole[];
  youCan: string;
  building: string;
  /** Route-backed destinations: the existing page this tile navigates to. */
  href?: string;
}

export const GPS_DESTINATIONS: readonly GpsReleaseDestination[] = [
  { id: "gps-guide", label: "GPS GUIDE", group: "GUIDE", state: "LIVE", openBadge: false, youCan: "Open the GPS guide.", building: "We're finishing the GPS guide." },
  { id: "your-page", label: "YOUR PAGE", group: "SOCIAL", state: "LIVE", openBadge: true, youCan: "Build and save your page.", building: "We're finishing page publishing." },
  { id: "publics", label: "PUBLICS", group: "SOCIAL", state: "LIVE", openBadge: true, youCan: "Look through public profiles.", building: "We're finishing public discovery.", href: "/search" },
  { id: "profile", label: "PROFILE", group: "SOCIAL", state: "LIVE", openBadge: true, youCan: "Open your profile.", building: "We're finishing profile tools.", href: "/profile" },
  { id: "messages", label: "MESSAGES", group: "SOCIAL", state: "LIVE", openBadge: true, youCan: "Message other members.", building: "We're building member messaging." },
  { id: "friends", label: "FRIENDS", group: "SOCIAL", state: "COMING_SOON", openBadge: false, youCan: "See accepted friends.", building: "We're building the accepted friends list and friend requests." },
  { id: "community", label: "COMMUNITY", group: "SOCIAL", state: "LIVE", openBadge: true, youCan: "Join the community conversation.", building: "We're building community chat." },
  { id: "articles", label: "ARTICLES", group: "CREATE", state: "COMING_SOON", openBadge: false, roles: ["performer"], youCan: "Open your article workspace.", building: "We're finishing article publishing." },
  { id: "yopho", label: "YOPHO", group: "CREATE", state: "LIVE", openBadge: true, youCan: "Open YoPho.", building: "We're finishing YoPho." },
  { id: "playlists", label: "PLAYLISTS", group: "CREATE", state: "LIVE", openBadge: true, youCan: "Open your playlists.", building: "We're finishing playlists." },
  { id: "avatar", label: "AVATAR", group: "CREATE", state: "COMING_SOON", openBadge: false, roles: ["fan"], youCan: "Customize your avatar.", building: "We're finishing Avatar." },
  { id: "avatar-live", label: "AVATAR LIVE", group: "CREATE", state: "HIDDEN", openBadge: false, roles: ["fan"], youCan: "Bring your avatar into a live room.", building: "We're finishing Avatar Live." },
  { id: "biography", label: "BIOGRAPHY", group: "CREATE", state: "COMING_SOON", openBadge: false, roles: ["performer"], youCan: "Edit your biography.", building: "We're finishing biography editing." },
  { id: "lobby", label: "LOBBY", group: "LIVE", state: "LIVE", openBadge: true, youCan: "Browse live rooms in the Lobby Wall.", building: "We're finishing the new TMI Lobby experience." },
  { id: "go-live", label: "GO LIVE", group: "LIVE", state: "COMING_SOON", openBadge: false, roles: ["performer"], youCan: "Go live on your stage.", building: "We're finishing Go Live." },
  { id: "camera", label: "CAMERA", group: "LIVE", state: "COMING_SOON", openBadge: false, youCan: "Use the camera.", building: "We're finishing the camera." },
  { id: "stage-tools", label: "STAGE TOOLS", group: "LIVE", state: "COMING_SOON", openBadge: false, roles: ["performer"], youCan: "Use stage tools.", building: "We're finishing stage tools." },
  { id: "videos", label: "VIDEOS", group: "MEDIA", state: "HIDDEN", openBadge: false, youCan: "Add videos to your page.", building: "We're finishing video storage on your page." },
  { id: "media", label: "MEDIA LOCKER", group: "MEDIA", state: "COMING_SOON", openBadge: false, roles: ["performer"], youCan: "Open your media locker.", building: "We're finishing the media locker." },
  { id: "memory-wall", label: "MEMORY WALL", group: "MEDIA", state: "COMING_SOON", openBadge: false, youCan: "Open your memory wall.", building: "We're finishing the memory wall." },
  { id: "inventory", label: "INVENTORY", group: "MEDIA", state: "COMING_SOON", openBadge: false, roles: ["fan"], youCan: "Open your inventory.", building: "We're finishing inventory." },
  { id: "store", label: "STORE", group: "COMMERCE", state: "COMING_SOON", openBadge: false, youCan: "Open the store.", building: "We're finishing the store." },
  { id: "rewards", label: "REWARDS", group: "COMMERCE", state: "COMING_SOON", openBadge: false, roles: ["fan"], youCan: "Open rewards.", building: "We're finishing rewards." },
  { id: "booking", label: "BOOKING", group: "COMMERCE", state: "COMING_SOON", openBadge: false, roles: ["performer"], youCan: "Take bookings.", building: "We're finishing booking." },
  { id: "promote", label: "PROMOTE", group: "COMMERCE", state: "COMING_SOON", openBadge: false, youCan: "Promote your work.", building: "We're finishing promotion." },
  { id: "commerce", label: "COMMERCE", group: "COMMERCE", state: "COMING_SOON", openBadge: false, roles: ["performer"], youCan: "Sell your music and items.", building: "We're building selling for music and items." },
  { id: "submissions", label: "SUBMISSIONS", group: "COMMERCE", state: "COMING_SOON", openBadge: false, roles: ["performer"], youCan: "Submit your music.", building: "We're finishing submissions." },
  { id: "beat-lab", label: "BEAT LAB", group: "COMMERCE", state: "COMING_SOON", openBadge: false, roles: ["performer"], youCan: "Open Beat Lab.", building: "We're finishing Beat Lab." },
  { id: "settings", label: "SETTINGS", group: "ACCOUNT", state: "LIVE", openBadge: false, youCan: "Open settings.", building: "We're finishing settings." },
  { id: "notifications", label: "NOTIFICATIONS", group: "ACCOUNT", state: "COMING_SOON", openBadge: false, youCan: "Open notifications.", building: "We're finishing notifications." },
  { id: "scores", label: "SCORES", group: "ACCOUNT", state: "COMING_SOON", openBadge: false, youCan: "Open scores.", building: "We're finishing scores." },
];

const BY_ID = new Map(GPS_DESTINATIONS.map((item) => [item.id, item]));

export function gpsDestinationById(id: string): GpsReleaseDestination | undefined {
  return BY_ID.get(id);
}

export function gpsDestinationHref(id: string): string | undefined {
  return BY_ID.get(id)?.href;
}

export function gpsDestinationState(id: string): GpsReleaseState {
  return BY_ID.get(id)?.state ?? "HIDDEN";
}

/** Rendered in GPS. Role filtering is separate. */
export function isGpsReleaseDestinationVisible(id: string): boolean {
  const state = gpsDestinationState(id);
  return state === "LIVE" || state === "COMING_SOON";
}

/** Hub drawer workspace → the release destination that governs it. */
const WORKSPACE_RELEASE_ID: Readonly<Record<string, string>> = {
  "memory-wall": "memory-wall",
  store: "store",
  shop: "store",
  merch: "store",
  "prize-vault": "rewards",
  inventory: "inventory",
  "avatar-quick": "avatar",
  messaging: "messages",
  "media-locker": "media",
  booking: "booking",
  notifications: "notifications",
  "bio-magazine": "biography",
};

/** GPS operating center → the release destination that governs it. */
const CENTER_RELEASE_ID: Readonly<Record<string, string>> = {
  communication: "messages",
  booking: "booking",
  media: "media",
  bio_magazine: "biography",
  commerce_center: "commerce",
  commercial: "store",
  shop_center: "store",
  marketplace_center: "store",
  avatar: "avatar",
  memory: "memory-wall",
  rewards: "rewards",
  beat_queue: "submissions",
};

function heldRelease(releaseId: string | undefined): GpsReleaseDestination | null {
  if (!releaseId) return null;
  const destination = BY_ID.get(releaseId);
  return destination && destination.state !== "LIVE" ? destination : null;
}

/** The held release a drawer workspace sits behind, or null when it may open. */
export function heldReleaseForWorkspace(workspaceId: string | null | undefined): GpsReleaseDestination | null {
  return workspaceId ? heldRelease(WORKSPACE_RELEASE_ID[workspaceId]) : null;
}

/** The held release a GPS operating center sits behind, or null when it may open. */
export function heldReleaseForCenter(centerId: string): GpsReleaseDestination | null {
  return heldRelease(CENTER_RELEASE_ID[centerId]);
}

export function gpsDestinationsForRole(role: GpsReleaseRole): GpsReleaseDestination[] {
  return GPS_DESTINATIONS.filter(
    (item) => item.state !== "HIDDEN" && (!item.roles || item.roles.includes(role)),
  );
}
