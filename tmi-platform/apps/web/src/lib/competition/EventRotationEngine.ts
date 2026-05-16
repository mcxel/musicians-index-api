/**
 * EventRotationEngine.ts
 * Full lifecycle: Queued → Countdown → Open → Live → Closed → Rewarded → Rotated
 * Auto-rotation: if nobody joins by countdown end → rotate genre → reset → reopen
 * Supports: Solo 1v1, Duo 2v2, Group 3-10, Band vs Band, Open Circle, Dirty Dozens
 */

export type EventStatus =
  | "queued"
  | "countdown"
  | "open"
  | "live"
  | "closed"
  | "rewarded"
  | "rotated";

export type MatchFormat =
  | "solo-1v1"
  | "duo-2v2"
  | "group-3v3"
  | "band-vs-band"
  | "open-circle"
  | "dirty-dozens";

export type EventType = "battle" | "cypher" | "contest";

export interface Genre {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  team?: string;
}

export interface EventReward {
  points: number;
  xp: number;
  storeItem?: string;
  badge?: string;
  sponsorPrize?: string;
}

export interface LiveEvent {
  id: string;
  type: EventType;
  format: MatchFormat;
  genre: Genre;
  title: string;
  roomImage?: string;
  status: EventStatus;
  participants: Participant[];
  maxParticipants: number;
  minParticipants: number;
  slotsLeft: number;
  viewerCount: number;
  countdownSeconds: number;
  absoluteStartTime: Date;
  reward: EventReward;
  sponsorId?: string;
  sponsorName?: string;
  hostId?: string;
  hostName?: string;
  hostAvatar?: string;
  rotationCount: number; // how many times genre has rotated due to no entrants
}

// All supported genres in rotation order
export const GENRE_ROTATION: Genre[] = [
  { id: "hip-hop", name: "Hip Hop", icon: "🎤", color: "#FF2DAA" },
  { id: "rnb", name: "R&B", icon: "🎵", color: "#AA2DFF" },
  { id: "country", name: "Country", icon: "🎸", color: "#FF6B35" },
  { id: "jazz", name: "Jazz", icon: "🎷", color: "#00FFFF" },
  { id: "afrobeat", name: "Afrobeat", icon: "🥁", color: "#00FF88" },
  { id: "pop", name: "Pop", icon: "🌟", color: "#FF2DAA" },
  { id: "rock", name: "Rock", icon: "🎸", color: "#FF6B35" },
  { id: "gospel", name: "Gospel", icon: "🎹", color: "#FFD700" },
  { id: "reggae", name: "Reggae", icon: "🎺", color: "#00FF88" },
  { id: "classical", name: "Classical", icon: "🎻", color: "#AA2DFF" },
  { id: "edm", name: "EDM", icon: "🎧", color: "#00FFFF" },
  { id: "latin", name: "Latin", icon: "🎙", color: "#FF6B35" },
];

// Battle type configs per match format
export const BATTLE_TYPES: Record<MatchFormat, string[]> = {
  "solo-1v1": [
    "Rapper vs Rapper",
    "Singer vs Singer",
    "Producer vs Producer",
    "Drummer vs Drummer",
    "Guitar vs Guitar",
    "Ukulele vs Ukulele",
    "Sitar vs Sitar",
    "DJ vs DJ",
  ],
  "duo-2v2": [
    "Duo Singers",
    "Producer + Rapper",
    "Drum Duo",
    "Guitar Duo",
    "Vocal Duo",
  ],
  "group-3v3": [
    "Band vs Band",
    "Choir vs Choir",
    "Crew vs Crew",
    "Producer Crew",
    "Rap Squad",
  ],
  "band-vs-band": [
    "Rock Band Battle",
    "Jazz Ensemble",
    "Full Band Showdown",
    "Orchestra Battle",
  ],
  "open-circle": [
    "Open Cypher",
    "Producer Circle",
    "Freestyle Circle",
    "Jazz Session",
    "Drum Circle",
  ],
  "dirty-dozens": [
    "Dirty Dozens",
    "Speed Bars",
    "Fast Elimination Round",
  ],
};

// Room images mapped to event types
export const ROOM_IMAGES: Record<EventType, string[]> = {
  battle: [
    "/tmi-curated/gameshow-31.jpg",
    "/tmi-curated/gameshow-35.jpg",
    "/tmi-curated/gameshow-36.jpg",
    "/tmi-curated/home5.png",
  ],
  cypher: [
    "/tmi-curated/venue-10.jpg",
    "/tmi-curated/venue-14.jpg",
    "/tmi-curated/venue-18.jpg",
    "/tmi-curated/venue-22.jpg",
  ],
  contest: [
    "/tmi-curated/home1.jpg",
    "/tmi-curated/mag-35.jpg",
    "/tmi-curated/gameshow-31.jpg",
  ],
};

export class EventRotationEngine {
  private events: Map<string, LiveEvent> = new Map();
  private genreIndex: number = 0;
  private subscribers: Set<() => void> = new Set();

  /**
   * Creates a new event from current genre rotation.
   */
  createEvent(
    type: EventType,
    format: MatchFormat,
    countdownSeconds: number,
    reward: EventReward,
    overrides?: Partial<LiveEvent>
  ): LiveEvent {
    const genre = GENRE_ROTATION[this.genreIndex % GENRE_ROTATION.length]!;
    const battleTypes = BATTLE_TYPES[format];
    const titleBase = battleTypes[Math.floor(Math.random() * battleTypes.length)]!;
    const roomImages = ROOM_IMAGES[type];
    const roomImage = roomImages[Math.floor(Math.random() * roomImages.length)];

    const maxParticipants =
      format === "solo-1v1" ? 2 :
      format === "duo-2v2" ? 4 :
      format === "group-3v3" ? 6 :
      format === "band-vs-band" ? 12 :
      format === "open-circle" ? 20 :
      format === "dirty-dozens" ? 16 : 2;

    const minParticipants =
      format === "solo-1v1" ? 2 :
      format === "duo-2v2" ? 2 :
      format === "open-circle" ? 1 : 3;

    const startTime = new Date();
    startTime.setSeconds(startTime.getSeconds() + countdownSeconds);

    const event: LiveEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type,
      format,
      genre,
      title: `${genre.name} ${titleBase}`,
      roomImage,
      status: countdownSeconds > 0 ? "countdown" : "open",
      participants: [],
      maxParticipants,
      minParticipants,
      slotsLeft: maxParticipants,
      viewerCount: 0,
      countdownSeconds,
      absoluteStartTime: startTime,
      reward,
      rotationCount: 0,
      ...overrides,
    };

    this.events.set(event.id, event);
    return event;
  }

  /**
   * Called when countdown ends with zero entrants.
   * Rotates genre, resets countdown, rebuilds room.
   */
  autoRotateEmpty(eventId: string): LiveEvent | null {
    const event = this.events.get(eventId);
    if (!event) return null;
    if (event.participants.length > 0) return event;

    this.genreIndex = (this.genreIndex + 1) % GENRE_ROTATION.length;
    const newGenre = GENRE_ROTATION[this.genreIndex]!;

    event.genre = newGenre;
    event.rotationCount += 1;
    event.countdownSeconds = 300; // 5 min reset
    event.status = "countdown";
    event.participants = [];
    event.slotsLeft = event.maxParticipants;
    event.viewerCount = 0;

    const battleTypes = BATTLE_TYPES[event.format];
    const titleBase = battleTypes[Math.floor(Math.random() * battleTypes.length)]!;
    event.title = `${newGenre.name} ${titleBase}`;

    const startTime = new Date();
    startTime.setSeconds(startTime.getSeconds() + event.countdownSeconds);
    event.absoluteStartTime = startTime;

    this.notify();
    return event;
  }

  /**
   * Advances event to next lifecycle status.
   */
  advanceStatus(eventId: string): EventStatus | null {
    const event = this.events.get(eventId);
    if (!event) return null;

    const transitions: Record<EventStatus, EventStatus> = {
      queued: "countdown",
      countdown: "open",
      open: "live",
      live: "closed",
      closed: "rewarded",
      rewarded: "rotated",
      rotated: "queued",
    };

    event.status = transitions[event.status];
    this.notify();
    return event.status;
  }

  /**
   * Adds a participant to an event.
   */
  joinEvent(eventId: string, participant: Participant): boolean {
    const event = this.events.get(eventId);
    if (!event || event.slotsLeft <= 0) return false;
    if (!["countdown", "open"].includes(event.status)) return false;

    event.participants.push(participant);
    event.slotsLeft -= 1;

    if (event.participants.length >= event.maxParticipants && event.status === "open") {
      event.status = "live";
    }

    this.notify();
    return true;
  }

  /**
   * Ticks countdown by 1 second. Returns true if countdown completed.
   */
  tickCountdown(eventId: string): boolean {
    const event = this.events.get(eventId);
    if (!event || event.countdownSeconds <= 0) return true;

    event.countdownSeconds -= 1;

    if (event.countdownSeconds <= 0) {
      if (event.participants.length === 0) {
        this.autoRotateEmpty(eventId);
      } else if (event.participants.length < event.minParticipants) {
        this.autoRotateEmpty(eventId);
      } else {
        event.status = "live";
        this.notify();
      }
      return true;
    }

    return false;
  }

  /**
   * Gets a live event by ID.
   */
  getEvent(eventId: string): LiveEvent | null {
    return this.events.get(eventId) || null;
  }

  /**
   * Gets events by status.
   */
  getEventsByStatus(status: EventStatus): LiveEvent[] {
    return Array.from(this.events.values()).filter(
      (e) => e.status === status
    );
  }

  /**
   * Gets live + open events (for LiveNow belt).
   */
  getLiveNowEvents(): LiveEvent[] {
    return Array.from(this.events.values()).filter(
      (e) => e.status === "live" || e.status === "open"
    );
  }

  /**
   * Gets countdown events (Starting Soon belt).
   */
  getStartingSoonEvents(): LiveEvent[] {
    return Array.from(this.events.values())
      .filter((e) => e.status === "countdown")
      .sort((a, b) => a.countdownSeconds - b.countdownSeconds);
  }

  /**
   * Gets all events (for board views).
   */
  getAllEvents(): LiveEvent[] {
    return Array.from(this.events.values());
  }

  /**
   * Subscribe to state changes.
   */
  subscribe(fn: () => void): () => void {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }

  /**
   * Notifies all subscribers of state changes.
   */
  private notify(): void {
    this.subscribers.forEach((fn) => fn());
  }

  /**
   * Gets current genre index in rotation.
   */
  getCurrentGenre(): Genre {
    return GENRE_ROTATION[this.genreIndex % GENRE_ROTATION.length]!;
  }

  /**
   * Formats countdown for display.
   */
  static formatCountdown(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  /**
   * Formats absolute time for display.
   */
  static formatAbsoluteTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  /**
   * Seeds the engine with a full slate of demo events for Home 5.
   */
  seedDemoEvents(): void {
    const baseReward: EventReward = {
      points: 5000,
      xp: 500,
      storeItem: "battle-item-reward",
      badge: "competitor-badge",
    };

    // LIVE events
    this.createEvent("battle", "solo-1v1", 0, { ...baseReward, points: 5000 }, {
      status: "live",
      viewerCount: 142,
      participants: [
        { id: "p1", name: "Nova Jay", avatar: "/artists/artist-01.png" },
        { id: "p2", name: "Renegade K", avatar: "/artists/artist-02.png" },
      ],
      slotsLeft: 0,
      hostName: "DJ Crown",
    });

    this.createEvent("cypher", "open-circle", 0, { ...baseReward, points: 3000, xp: 400 }, {
      status: "live",
      viewerCount: 89,
      participants: [
        { id: "p3", name: "Astra Nova", avatar: "/artists/artist-03.png" },
        { id: "p4", name: "Lynx MC", avatar: "/artists/artist-04.png" },
        { id: "p5", name: "Pulse", avatar: "/artists/artist-05.png" },
      ],
      slotsLeft: 17,
      hostName: "Cipher Queen",
    });

    this.createEvent("battle", "duo-2v2", 0, { ...baseReward, points: 6000 }, {
      status: "open",
      viewerCount: 34,
      participants: [
        { id: "p6", name: "Team Neon", avatar: "/artists/artist-06.png" },
      ],
      slotsLeft: 3,
      hostName: "Blaze Host",
    });

    // STARTING SOON events
    this.createEvent("battle", "solo-1v1", 192, { ...baseReward, points: 5000 });
    this.createEvent("cypher", "open-circle", 520, { ...baseReward, points: 3000 });
    this.createEvent("contest", "dirty-dozens", 840, { ...baseReward, points: 8000, badge: "dirty-dozens-badge" });
    this.createEvent("battle", "band-vs-band", 1080, { ...baseReward, points: 10000, sponsorPrize: "Sponsor Merch Pack" });
    this.createEvent("battle", "group-3v3", 1440, { ...baseReward, points: 7000 });
  }
}

// Singleton instance seeded with demo events
export const eventRotationEngine = new EventRotationEngine();
eventRotationEngine.seedDemoEvents();
