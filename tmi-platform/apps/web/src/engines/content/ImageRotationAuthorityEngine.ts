export type RotationImageInput = string | { url: string; weight?: number; priority?: number };

export type RotationStrategy = "weighted-random" | "sequential";

export interface RotationEngineOptions {
  strategy?: RotationStrategy;
  antiRepeatWindow?: number;
  startIndex?: number;
}

type RotationItem = {
  url: string;
  weight: number;
  priority: number;
};

export class ImageRotationAuthorityEngine {
  private readonly items: RotationItem[];
  private readonly strategy: RotationStrategy;
  private readonly antiRepeatWindow: number;
  private currentIndex: number;
  private recentIndices: number[] = [];

  constructor(images: RotationImageInput[], options: RotationEngineOptions = {}) {
    this.items = images
      .map((entry) =>
        typeof entry === "string"
          ? { url: entry, weight: 1, priority: 1 }
          : {
              url: entry.url,
              weight: Math.max(0.1, entry.weight ?? 1),
              priority: Math.max(0.1, entry.priority ?? 1),
            }
      )
      .filter((entry) => Boolean(entry.url));

    this.strategy = options.strategy ?? "weighted-random";
    this.antiRepeatWindow = Math.max(1, options.antiRepeatWindow ?? 2);

    const start = options.startIndex ?? 0;
    this.currentIndex = this.items.length > 0 ? Math.max(0, Math.min(start, this.items.length - 1)) : 0;
    if (this.items.length > 0) {
      this.recentIndices = [this.currentIndex];
    }
  }

  getCurrentImage(): string {
    return this.items[this.currentIndex]?.url ?? "";
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  getCount(): number {
    return this.items.length;
  }

  nextAuto(): string {
    if (this.items.length <= 1) return this.getCurrentImage();

    if (this.strategy === "sequential") {
      this.currentIndex = (this.currentIndex + 1) % this.items.length;
      this.markRecent(this.currentIndex);
      return this.getCurrentImage();
    }

    this.currentIndex = this.pickWeightedIndex();
    this.markRecent(this.currentIndex);
    return this.getCurrentImage();
  }

  nextManual(): string {
    if (this.items.length <= 1) return this.getCurrentImage();
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    this.markRecent(this.currentIndex);
    return this.getCurrentImage();
  }

  prevManual(): string {
    if (this.items.length <= 1) return this.getCurrentImage();
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    this.markRecent(this.currentIndex);
    return this.getCurrentImage();
  }

  getNextPreviewImage(): string {
    if (this.items.length <= 1) return this.getCurrentImage();
    const candidate = this.pickWeightedIndex(true);
    return this.items[candidate]?.url ?? this.getCurrentImage();
  }

  async preloadImage(url: string): Promise<void> {
    if (!url || typeof window === "undefined") return;
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = url;
    });
  }

  async preloadNext(): Promise<void> {
    await this.preloadImage(this.getNextPreviewImage());
  }

  private pickWeightedIndex(peekOnly = false): number {
    const blocked = new Set(this.recentIndices.slice(-this.antiRepeatWindow));
    blocked.delete(this.currentIndex);

    let candidates = this.items
      .map((item, index) => ({ index, score: item.weight * item.priority }))
      .filter((entry) => !blocked.has(entry.index) && entry.index !== this.currentIndex);

    if (candidates.length === 0) {
      candidates = this.items
        .map((item, index) => ({ index, score: item.weight * item.priority }))
        .filter((entry) => entry.index !== this.currentIndex);
    }

    if (candidates.length === 0) return this.currentIndex;

    const total = candidates.reduce((sum, item) => sum + item.score, 0);
    let threshold = Math.random() * total;

    for (const candidate of candidates) {
      threshold -= candidate.score;
      if (threshold <= 0) {
        return candidate.index;
      }
    }

    return candidates[candidates.length - 1].index;
  }

  private markRecent(index: number): void {
    this.recentIndices.push(index);
    const maxRecent = Math.min(this.items.length, Math.max(2, this.antiRepeatWindow + 1));
    if (this.recentIndices.length > maxRecent) {
      this.recentIndices = this.recentIndices.slice(-maxRecent);
    }
  }
}
