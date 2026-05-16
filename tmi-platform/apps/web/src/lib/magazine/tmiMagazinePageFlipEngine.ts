export type TmiFlipDirection = "forward" | "backward" | null;
export type TmiPeelOrigin =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "left-edge"
  | "right-edge"
  | "top-edge"
  | "bottom-edge";

export interface TmiMagazineFlipState {
  currentPage: number;
  isOpening: boolean;
  isClosing: boolean;
  isFlipping: boolean;
  flipDirection: TmiFlipDirection;
}

export interface TmiMagazineFlipSnapshot extends TmiMagazineFlipState {
  priorPage: number;
  canGoBack: boolean;
  canGoForward: boolean;
  swipeVelocity: number;
  swipeDistance: number;
  swipeDirection: TmiFlipDirection;
  rapidFlipCount: number;
  rapidFlipQueue: number[];
  visibleGhostPages: number[];
  targetPageIndex: number;
  previewPageIndex: number;
  isRapidFlipping: boolean;
  peelOrigin: TmiPeelOrigin;
}

export interface TmiMagazineFlipEngineOptions {
  totalPages: number;
  initialPage?: number;
  flipDurationMs?: number;
  maxRapidFlipPages?: number;
  minSwipeVelocityForRapid?: number;
  minDistanceForFlip?: number;
  onPageTurnStarted?: (nextPage: number, direction: Exclude<TmiFlipDirection, null>) => void;
  onPageTurnCompleted?: (page: number) => void;
}

export interface TmiRapidSwipeInput {
  velocity: number;
  distance: number;
  direction: Exclude<TmiFlipDirection, null>;
  reducedMotion?: boolean;
  peelOrigin?: TmiPeelOrigin;
}

const DEFAULT_FLIP_MS = 520;

export class TmiMagazinePageFlipEngine {
  private totalPages: number;
  private flipDurationMs: number;
  private priorPageIndex: number;
  private maxRapidFlipPages: number;
  private minSwipeVelocityForRapid: number;
  private minDistanceForFlip: number;

  private state: TmiMagazineFlipState;
  private swipeVelocity = 0;
  private swipeDistance = 0;
  private swipeDirection: TmiFlipDirection = null;
  private rapidFlipCount = 0;
  private rapidFlipQueue: number[] = [];
  private visibleGhostPages: number[] = [];
  private targetPageIndex = 0;
  private previewPageIndex = 0;
  private isRapidFlipping = false;
  private peelOrigin: TmiPeelOrigin = "right-edge";

  private onPageTurnStarted?: TmiMagazineFlipEngineOptions["onPageTurnStarted"];
  private onPageTurnCompleted?: TmiMagazineFlipEngineOptions["onPageTurnCompleted"];

  constructor(options: TmiMagazineFlipEngineOptions) {
    const maxIndex = Math.max(0, options.totalPages - 1);
    const initialPage = Math.min(Math.max(options.initialPage ?? 0, 0), maxIndex);

    this.totalPages = Math.max(1, options.totalPages);
    this.flipDurationMs = options.flipDurationMs ?? DEFAULT_FLIP_MS;
    this.maxRapidFlipPages = Math.max(1, Math.min(10, options.maxRapidFlipPages ?? 10));
    this.minSwipeVelocityForRapid = options.minSwipeVelocityForRapid ?? 0.8;
    this.minDistanceForFlip = options.minDistanceForFlip ?? 80;

    this.priorPageIndex = initialPage;
    this.targetPageIndex = initialPage;
    this.previewPageIndex = initialPage;

    this.state = {
      currentPage: initialPage,
      isOpening: false,
      isClosing: false,
      isFlipping: false,
      flipDirection: null,
    };

    this.onPageTurnStarted = options.onPageTurnStarted;
    this.onPageTurnCompleted = options.onPageTurnCompleted;
  }

  getSnapshot(): TmiMagazineFlipSnapshot {
    return {
      ...this.state,
      priorPage: this.priorPageIndex,
      canGoBack: this.state.currentPage > 0,
      canGoForward: this.state.currentPage < this.totalPages - 1,
      swipeVelocity: this.swipeVelocity,
      swipeDistance: this.swipeDistance,
      swipeDirection: this.swipeDirection,
      rapidFlipCount: this.rapidFlipCount,
      rapidFlipQueue: [...this.rapidFlipQueue],
      visibleGhostPages: [...this.visibleGhostPages],
      targetPageIndex: this.targetPageIndex,
      previewPageIndex: this.previewPageIndex,
      isRapidFlipping: this.isRapidFlipping,
      peelOrigin: this.peelOrigin,
    };
  }

  setPreviewFromSwipe(distance: number, direction: Exclude<TmiFlipDirection, null>, peelOrigin?: TmiPeelOrigin): TmiMagazineFlipSnapshot {
    this.swipeDistance = Math.abs(distance);
    this.swipeDirection = direction;
    if (peelOrigin) this.peelOrigin = peelOrigin;

    const pageDelta = this.derivePageDelta(0, this.swipeDistance, direction);
    this.previewPageIndex = this.clampPage(this.state.currentPage + (direction === "forward" ? pageDelta : -pageDelta));
    this.targetPageIndex = this.previewPageIndex;
    this.visibleGhostPages = this.computeGhostPages(this.state.currentPage, this.previewPageIndex);

    return this.getSnapshot();
  }

  async applySwipe(input: TmiRapidSwipeInput): Promise<TmiMagazineFlipSnapshot> {
    if (this.state.isFlipping) return this.getSnapshot();

    this.swipeVelocity = Math.abs(input.velocity);
    this.swipeDistance = Math.abs(input.distance);
    this.swipeDirection = input.direction;
    this.peelOrigin = input.peelOrigin ?? this.peelOrigin;

    if (this.swipeDistance < this.minDistanceForFlip) {
      this.previewPageIndex = this.state.currentPage;
      this.targetPageIndex = this.state.currentPage;
      this.visibleGhostPages = [];
      return this.getSnapshot();
    }

    const requestedPages = this.derivePageDelta(this.swipeVelocity, this.swipeDistance, input.direction);
    const clampedPages = Math.min(this.maxRapidFlipPages, Math.max(1, requestedPages));
    const signedDelta = input.direction === "forward" ? clampedPages : -clampedPages;
    const finalTarget = this.clampPage(this.state.currentPage + signedDelta);

    this.targetPageIndex = finalTarget;
    this.previewPageIndex = finalTarget;
    this.rapidFlipCount = Math.abs(finalTarget - this.state.currentPage);
    this.visibleGhostPages = input.reducedMotion ? [] : this.computeGhostPages(this.state.currentPage, finalTarget);

    if (this.rapidFlipCount <= 1 || this.swipeVelocity < this.minSwipeVelocityForRapid || input.reducedMotion) {
      this.rapidFlipQueue = [];
      return this.flipTo(finalTarget, input.direction);
    }

    this.rapidFlipQueue = this.buildQueue(this.state.currentPage, finalTarget);
    this.isRapidFlipping = true;

    while (this.rapidFlipQueue.length > 0) {
      const nextPage = this.rapidFlipQueue.shift()!;
      const dir: Exclude<TmiFlipDirection, null> = nextPage > this.state.currentPage ? "forward" : "backward";
      await this.flipTo(nextPage, dir, Math.max(90, Math.floor(this.flipDurationMs * 0.34)));
    }

    this.isRapidFlipping = false;
    this.visibleGhostPages = [];
    return this.getSnapshot();
  }

  async open(): Promise<TmiMagazineFlipSnapshot> {
    if (this.state.isOpening) return this.getSnapshot();
    this.state.isOpening = true;
    this.state.isClosing = false;
    await this.delay(Math.floor(this.flipDurationMs * 0.85));
    this.state.isOpening = false;
    return this.getSnapshot();
  }

  async close(): Promise<TmiMagazineFlipSnapshot> {
    if (this.state.isClosing) return this.getSnapshot();
    this.state.isClosing = true;
    this.state.isOpening = false;
    await this.delay(Math.floor(this.flipDurationMs * 0.85));
    this.state.isClosing = false;
    return this.getSnapshot();
  }

  async nextPage(): Promise<TmiMagazineFlipSnapshot> {
    const current = this.state.currentPage;
    if (current >= this.totalPages - 1 || this.state.isFlipping) return this.getSnapshot();
    return this.flipTo(current + 1, "forward");
  }

  async previousPage(): Promise<TmiMagazineFlipSnapshot> {
    const current = this.state.currentPage;
    if (current <= 0 || this.state.isFlipping) return this.getSnapshot();
    return this.flipTo(current - 1, "backward");
  }

  async jumpToFirst(): Promise<TmiMagazineFlipSnapshot> {
    return this.flipTo(0, "backward");
  }

  async jumpToLast(): Promise<TmiMagazineFlipSnapshot> {
    return this.flipTo(this.totalPages - 1, "forward");
  }

  async flipTo(page: number, direction: Exclude<TmiFlipDirection, null>, durationOverride?: number): Promise<TmiMagazineFlipSnapshot> {
    if (this.state.isFlipping) return this.getSnapshot();
    if (page < 0 || page > this.totalPages - 1) return this.getSnapshot();
    if (page === this.state.currentPage) return this.getSnapshot();

    this.state.isFlipping = true;
    this.state.flipDirection = direction;
    this.onPageTurnStarted?.(page, direction);

    await this.delay(durationOverride ?? this.flipDurationMs);

    this.priorPageIndex = this.state.currentPage;
    this.state.currentPage = page;
    this.state.isFlipping = false;
    this.state.flipDirection = null;
    this.onPageTurnCompleted?.(this.state.currentPage);

    return this.getSnapshot();
  }

  private derivePageDelta(velocity: number, distance: number, direction: Exclude<TmiFlipDirection, null>): number {
    const byDistance = Math.floor(distance / this.minDistanceForFlip);
    const byVelocity = velocity >= this.minSwipeVelocityForRapid ? Math.floor(velocity * 3) : 1;
    const candidate = Math.max(1, Math.max(byDistance, byVelocity));
    if (velocity > 2.4) return Math.min(10, candidate + 2);
    if (distance > this.minDistanceForFlip * 4) return Math.min(5, candidate);
    return direction ? candidate : 1;
  }

  private buildQueue(start: number, end: number): number[] {
    const queue: number[] = [];
    const step = end > start ? 1 : -1;
    for (let p = start + step; step > 0 ? p <= end : p >= end; p += step) queue.push(p);
    return queue;
  }

  private computeGhostPages(start: number, end: number): number[] {
    const ghosts: number[] = [];
    const step = end > start ? 1 : -1;
    for (let p = start + step; step > 0 ? p <= end : p >= end; p += step) ghosts.push(p);
    return ghosts.slice(0, 10);
  }

  private clampPage(page: number): number {
    return Math.min(this.totalPages - 1, Math.max(0, page));
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
