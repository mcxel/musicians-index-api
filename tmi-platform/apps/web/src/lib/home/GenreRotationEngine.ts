/**
 * GenreRotationEngine.ts
 * Cycles active genre for Home 1 cover.
 * Genre changes affect: background color, particle color, badge color, contestant filter.
 */

export interface GenreConfig {
  id: string;
  name: string;
  icon: string;
  primary: string;   // main accent color
  secondary: string; // gradient pair
  particle: string;  // particle/confetti color
  label: string;     // display label e.g. "HIP HOP BATTLE"
}

export type Home1ShowcaseMode =
  | "battle"
  | "cypher"
  | "dirty-dozens"
  | "monday-stage"
  | "contest";

export interface ShowcaseConfig {
  id: Home1ShowcaseMode;
  label: string;
  route: string;
}

export const COVER_GENRES: GenreConfig[] = [
  { id: "hip-hop",    name: "Hip Hop",   icon: "🎤", primary: "#FF2DAA", secondary: "#AA2DFF", particle: "#FF2DAA", label: "HIP HOP BATTLE" },
  { id: "country",   name: "Country",   icon: "🎸", primary: "#FF6B35", secondary: "#FFD700", particle: "#FF6B35", label: "COUNTRY BATTLE" },
  { id: "jazz",      name: "Jazz",      icon: "🎷", primary: "#00FFFF", secondary: "#0088FF", particle: "#00FFFF", label: "JAZZ SHOWDOWN" },
  { id: "rock",      name: "Rock",      icon: "🎸", primary: "#FF4444", secondary: "#FF6B35", particle: "#FF4444", label: "ROCK BATTLE" },
  { id: "rnb",       name: "R&B",       icon: "🎵", primary: "#AA2DFF", secondary: "#FF2DAA", particle: "#AA2DFF", label: "R&B CROWN" },
  { id: "electronic",name: "Electronic",icon: "🎧", primary: "#00FFFF", secondary: "#00FF88", particle: "#00FFFF", label: "ELECTRONIC BATTLE" },
  { id: "afrobeat",  name: "Afrobeat",  icon: "🥁", primary: "#00FF88", secondary: "#FFD700", particle: "#00FF88", label: "AFROBEAT CYPHER" },
  { id: "pop",       name: "Pop",       icon: "🌟", primary: "#FFD700", secondary: "#FF2DAA", particle: "#FFD700", label: "POP CROWN" },
];

export const HOME1_SHOWCASE_ROTATION: ShowcaseConfig[] = [
  { id: "battle", label: "Battle", route: "/battles/live" },
  { id: "cypher", label: "Cypher", route: "/cypher/live" },
  { id: "dirty-dozens", label: "Dirty Dozens", route: "/games/dirty-dozens" },
  { id: "monday-stage", label: "Monday Stage", route: "/games/monday-night" },
  { id: "contest", label: "Contest", route: "/contests/live" },
];

export class GenreRotationEngine {
  private index = 0;
  private cycleIndex = 0;
  private subscribers: Set<(genre: GenreConfig) => void> = new Set();
  private cycleSubscribers: Set<(showcase: ShowcaseConfig) => void> = new Set();
  private timer: ReturnType<typeof setInterval> | null = null;

  start(intervalMs = 14000) {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.index = (this.index + 1) % COVER_GENRES.length;
      this.cycleIndex = (this.cycleIndex + 1) % HOME1_SHOWCASE_ROTATION.length;
      this.notify();
      this.notifyCycle();
    }, intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  current(): GenreConfig {
    return COVER_GENRES[this.index]!;
  }

  currentShowcase(): ShowcaseConfig {
    return HOME1_SHOWCASE_ROTATION[this.cycleIndex]!;
  }

  subscribe(fn: (g: GenreConfig) => void): () => void {
    this.subscribers.add(fn);
    fn(this.current());
    return () => this.subscribers.delete(fn);
  }

  subscribeShowcase(fn: (s: ShowcaseConfig) => void): () => void {
    this.cycleSubscribers.add(fn);
    fn(this.currentShowcase());
    return () => this.cycleSubscribers.delete(fn);
  }

  private notify() {
    const g = this.current();
    this.subscribers.forEach((fn) => fn(g));
  }

  private notifyCycle() {
    const s = this.currentShowcase();
    this.cycleSubscribers.forEach((fn) => fn(s));
  }
}

export const genreRotationEngine = new GenreRotationEngine();
