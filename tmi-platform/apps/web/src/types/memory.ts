// Shared memory types — tickets, NFTs, polaroids, prizes, clips

export type MemoryItemKind =
  | "polaroid"
  | "ticket"
  | "nft"
  | "prize"
  | "video-clip"
  | "badge"
  | "event-poster";

export interface MemoryItem {
  id: string;
  kind: MemoryItemKind;
  title: string;
  subtitle?: string;
  mediaUrl?: string;
  /** Source event or room */
  eventId?: string;
  eventTitle?: string;
  venueName?: string;
  date?: string;
  /** Only public memories can be shown in room broadcasts */
  visibility: "public" | "friends" | "private";
  capturedAt: string;
}
