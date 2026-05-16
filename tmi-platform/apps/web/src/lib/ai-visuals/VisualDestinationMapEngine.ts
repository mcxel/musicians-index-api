export type VisualDestinationEntry = {
  destinationId: string;
  label: string;
  routePath: string;
  slotName: string;
  entityOwner: string;
  assetFamily: string;
};

const DESTINATIONS: VisualDestinationEntry[] = [
  { destinationId: "artist-profile", label: "artist profile", routePath: "/artists/[slug]", slotName: "artist-profile-hero", entityOwner: "artist", assetFamily: "profile" },
  { destinationId: "performer-profile", label: "performer profile", routePath: "/performers/[slug]", slotName: "performer-profile-hero", entityOwner: "performer", assetFamily: "profile" },
  { destinationId: "fan-profile", label: "fan profile", routePath: "/fan/[slug]", slotName: "fan-profile-hero", entityOwner: "fan", assetFamily: "profile" },
  { destinationId: "venue-hero", label: "venue hero", routePath: "/venues/[slug]", slotName: "venue-hero", entityOwner: "venue", assetFamily: "venue" },
  { destinationId: "venue-skin", label: "venue skin", routePath: "/venues/[slug]/live", slotName: "venue-skin", entityOwner: "venue", assetFamily: "venue" },
  { destinationId: "ticket-visual", label: "ticket visual", routePath: "/tickets/[id]", slotName: "ticket-art", entityOwner: "ticket", assetFamily: "ticket" },
  { destinationId: "article-hero", label: "article hero", routePath: "/articles/[category]/[slug]", slotName: "article-hero", entityOwner: "editorial", assetFamily: "article" },
  { destinationId: "event-poster", label: "event poster", routePath: "/events/[slug]", slotName: "event-poster", entityOwner: "events", assetFamily: "event" },
  { destinationId: "battle-poster", label: "battle poster", routePath: "/battles/[slug]", slotName: "battle-poster", entityOwner: "battle", assetFamily: "battle" },
  { destinationId: "homepage-hero", label: "homepage hero", routePath: "/home/1", slotName: "home-1-hero", entityOwner: "homepage-runtime", assetFamily: "homepage" },
  { destinationId: "magazine-cover", label: "magazine cover", routePath: "/magazine", slotName: "magazine-cover", entityOwner: "magazine", assetFamily: "magazine" },
  { destinationId: "billboard", label: "billboard", routePath: "/billboard/[id]", slotName: "billboard-slot", entityOwner: "billboard", assetFamily: "billboard" },
  { destinationId: "sponsor-ad", label: "sponsor ad", routePath: "/sponsors/[slug]", slotName: "sponsor-ad", entityOwner: "sponsor", assetFamily: "sponsor" },
  { destinationId: "advertiser-ad", label: "advertiser ad", routePath: "/advertisers/[slug]", slotName: "advertiser-ad", entityOwner: "advertiser", assetFamily: "advertiser" },
  { destinationId: "bot-avatar", label: "bot avatar", routePath: "/bots/[id]", slotName: "bot-avatar", entityOwner: "bot", assetFamily: "bot" },
  { destinationId: "host-portrait", label: "host portrait", routePath: "/hosts/[slug]", slotName: "host-portrait", entityOwner: "host", assetFamily: "host" },
  { destinationId: "julius-portrait", label: "Julius portrait", routePath: "/profile/artist/julius", slotName: "julius-portrait", entityOwner: "julius", assetFamily: "artist" },
  { destinationId: "big-ace-portrait", label: "Big Ace portrait", routePath: "/admin/big-ace/overview", slotName: "big-ace-portrait", entityOwner: "big-ace", assetFamily: "admin" },
];

export function listVisualDestinations(): VisualDestinationEntry[] {
  return DESTINATIONS;
}

export function resolveDestinationByRoute(routePath: string): VisualDestinationEntry {
  const normalized = routePath.toLowerCase();
  return (
    DESTINATIONS.find((entry) => normalized.includes(entry.routePath.replace(/[\[\]{}]/g, "").split("/").filter(Boolean)[0]?.toLowerCase() ?? "")) ??
    DESTINATIONS.find((entry) => normalized.includes(entry.label.split(" ")[0].toLowerCase())) ??
    DESTINATIONS[0]
  );
}
