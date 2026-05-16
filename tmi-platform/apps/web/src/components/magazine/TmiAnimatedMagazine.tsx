"use client";

import type { ReactNode } from "react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  TmiMagazinePageFlipEngine,
  type TmiFlipDirection,
  type TmiMagazineFlipSnapshot,
  type TmiPeelOrigin,
} from "@/lib/magazine/tmiMagazinePageFlipEngine";
import { TmiMagazineAudioEngine } from "@/lib/magazine/tmiMagazineAudioEngine";
import type { TmiMagazinePageMeta } from "@/lib/magazine/tmiMagazineMetadataModel";
import {
  TMI_MAGAZINE_IDLE_TIMERS_MS,
  getRandomSearchDurationMs,
  type TmiMagazineVisualState,
} from "@/lib/magazine/tmiMagazineLayerModel";
import { TMI_MAGAZINE_Z_INDEX } from "@/lib/magazine/tmiMagazineZIndex";
import TmiMagazineBackgroundLayer from "./TmiMagazineBackgroundLayer";
import TmiMagazineUnderlayLayer from "./TmiMagazineUnderlayLayer";
import TmiMagazinePageSkeleton from "./TmiMagazinePageSkeleton";
import TmiMagazineOverlayLayer from "./TmiMagazineOverlayLayer";
import TmiMagazineInteractionLayer from "./TmiMagazineInteractionLayer";
import TmiMagazinePageCurl from "./TmiMagazinePageCurl";
import TmiMagazineControls from "./TmiMagazineControls";
import TmiMagazineCoverLoop from "./TmiMagazineCoverLoop";
import PageTurnHinge from "./PageTurnHinge";

interface TmiAnimatedMagazineProps {
  pages: TmiMagazinePageMeta[];
  initialPage?: number;
  className?: string;
  surfaceTone?: "cyan" | "fuchsia";
  embeddedContent?: ReactNode;
  hideMetaPanel?: boolean;
  enableCoverLoop?: boolean;
  onNavigate?: (page: TmiMagazinePageMeta) => void;
}

const EMPTY_STATE: TmiMagazineFlipSnapshot = {
  currentPage: 0,
  priorPage: 0,
  canGoBack: false,
  canGoForward: false,
  isOpening: false,
  isClosing: false,
  isFlipping: false,
  flipDirection: null,
  swipeVelocity: 0,
  swipeDistance: 0,
  swipeDirection: null,
  rapidFlipCount: 0,
  rapidFlipQueue: [],
  visibleGhostPages: [],
  targetPageIndex: 0,
  previewPageIndex: 0,
  isRapidFlipping: false,
  peelOrigin: "right-edge",
};

const SWIPE_AXIS_THRESHOLD = 8;

export default function TmiAnimatedMagazine({
  pages,
  initialPage = 0,
  className,
  surfaceTone = "cyan",
  embeddedContent,
  hideMetaPanel = false,
  enableCoverLoop = false,
  onNavigate,
}: TmiAnimatedMagazineProps) {
  const flipEngineRef = useRef<TmiMagazinePageFlipEngine | null>(null);
  const audioRef = useRef<TmiMagazineAudioEngine | null>(null);
  const pointerRef = useRef<{ x: number; y: number; t: number } | null>(null);

  const [snapshot, setSnapshot] = useState<TmiMagazineFlipSnapshot>(EMPTY_STATE);
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visualState, setVisualState] = useState<TmiMagazineVisualState>("closedIdle");
  const [failedImages, setFailedImages] = useState<Record<string, true>>({});

  const currentPage = pages[snapshot.currentPage] ?? pages[0];
  const safeCurrentPage = useMemo(() => {
    if (!currentPage?.backgroundImage) return currentPage;
    if (!failedImages[currentPage.backgroundImage]) return currentPage;
    return { ...currentPage, backgroundImage: undefined };
  }, [currentPage, failedImages]);
  const toneClass = useMemo(
    () =>
      surfaceTone === "fuchsia"
        ? "border-fuchsia-300/35 bg-gradient-to-b from-fuchsia-500/15 via-black/55 to-black/75"
        : "border-cyan-300/35 bg-gradient-to-b from-cyan-500/15 via-black/55 to-black/75",
    [surfaceTone]
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    console.info("[TmiAnimatedMagazine] mount", { pageCount: pages.length, initialPage });
    const audio = new TmiMagazineAudioEngine();
    audioRef.current = audio;
    setSoundEnabled(audio.soundEnabled);

    const engine = new TmiMagazinePageFlipEngine({
      totalPages: Math.max(1, pages.length),
      initialPage,
      maxRapidFlipPages: 10,
      minSwipeVelocityForRapid: 0.8,
      minDistanceForFlip: 80,
      onPageTurnStarted: () => {
        void audio.playPageTurn();
      },
      onPageTurnCompleted: (page) => {
        const next = pages[page];
        if (next) onNavigate?.(next);
      },
    });

    flipEngineRef.current = engine;
    setSnapshot(engine.getSnapshot());
  }, [initialPage, onNavigate, pages]);

  useEffect(() => {
    if (!safeCurrentPage?.backgroundImage || typeof window === "undefined") return;

    let cancelled = false;
    const image = new window.Image();
    const assetUrl = safeCurrentPage.backgroundImage;

    console.info("[TmiAnimatedMagazine] preload image", assetUrl);

    image.onload = () => {
      if (!cancelled) {
        console.info("[TmiAnimatedMagazine] image ready", assetUrl);
      }
    };

    image.onerror = () => {
      if (cancelled) return;
      console.warn("[TmiAnimatedMagazine] image fallback", assetUrl);
      setFailedImages((current) => {
        if (current[assetUrl]) return current;
        return { ...current, [assetUrl]: true };
      });
    };

    image.src = assetUrl;

    return () => {
      cancelled = true;
    };
  }, [safeCurrentPage?.backgroundImage]);

  useEffect(() => {
    let cancelled = false;
    let searchTimer: number | undefined;

    const idleTimer = window.setTimeout(() => {
      if (cancelled) return;
      setVisualState("searchTransition");
      void audioRef.current?.playSoftSwipe();

      const searchDuration = getRandomSearchDurationMs();
      searchTimer = window.setTimeout(async () => {
        if (cancelled) return;
        if (flipEngineRef.current) {
          const next = await flipEngineRef.current.open();
          if (!cancelled) setSnapshot(next);
        }
        setIsOpen(true);
        setVisualState("openIdle");
        void audioRef.current?.playPageOpen();
      }, searchDuration);
    }, TMI_MAGAZINE_IDLE_TIMERS_MS.closedIdleDuration);

    return () => {
      cancelled = true;
      window.clearTimeout(idleTimer);
      if (searchTimer) window.clearTimeout(searchTimer);
    };
  }, []);

  useEffect(() => {
    const handler = async (event: KeyboardEvent) => {
      if (!flipEngineRef.current) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        await handlePrevious();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        await handleNext();
      } else if (event.key.toLowerCase() === "m") {
        event.preventDefault();
        handleToggleMute();
      } else if (event.key === "Escape") {
        event.preventDefault();
        await handleClose();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  async function handleOpen() {
    if (!flipEngineRef.current) return;
    const next = await flipEngineRef.current.open();
    setSnapshot(next);
    setIsOpen(true);
    setVisualState("openIdle");
    await audioRef.current?.playPageOpen();
  }

  async function handleClose() {
    if (!flipEngineRef.current) return;
    const next = await flipEngineRef.current.close();
    setSnapshot(next);
    setIsOpen(false);
    setVisualState("closedIdle");
    await audioRef.current?.playPageClose();
  }

  async function handleNext() {
    if (!flipEngineRef.current) return;
    const next = await flipEngineRef.current.nextPage();
    setSnapshot(next);
  }

  async function handlePrevious() {
    if (!flipEngineRef.current) return;
    const next = await flipEngineRef.current.previousPage();
    setSnapshot(next);
  }

  async function handleJumpToFirst() {
    if (!flipEngineRef.current) return;
    const next = await flipEngineRef.current.jumpToFirst();
    setSnapshot(next);
  }

  async function handleJumpToLast() {
    if (!flipEngineRef.current) return;
    const next = await flipEngineRef.current.jumpToLast();
    setSnapshot(next);
  }

  async function handleJumpToPage(page: number) {
    if (!flipEngineRef.current) return;
    const direction: Exclude<TmiFlipDirection, null> = page >= snapshot.currentPage ? "forward" : "backward";
    const next = await flipEngineRef.current.flipTo(page, direction);
    setSnapshot(next);
  }

  function handleToggleMute() {
    const audio = audioRef.current;
    if (!audio) return;
    const enabled = audio.toggleMute();
    setSoundEnabled(enabled);
  }

  function derivePeelOrigin(clientX: number, clientY: number, rect: DOMRect): TmiPeelOrigin {
    const xRatio = (clientX - rect.left) / rect.width;
    const yRatio = (clientY - rect.top) / rect.height;
    const fromLeft = xRatio < 0.15;
    const fromRight = xRatio > 0.85;
    const fromTop = yRatio < 0.15;
    const fromBottom = yRatio > 0.85;

    if (fromTop && fromRight) return "top-right";
    if (fromTop && fromLeft) return "top-left";
    if (fromBottom && fromRight) return "bottom-right";
    if (fromBottom && fromLeft) return "bottom-left";
    if (fromTop) return "top-edge";
    if (fromBottom) return "bottom-edge";
    if (fromLeft) return "left-edge";
    return "right-edge";
  }

  async function onPointerDown(event: React.PointerEvent<HTMLElement>) {
    pointerRef.current = { x: event.clientX, y: event.clientY, t: performance.now() };
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    void audioRef.current?.playSoftSwipe();
  }

  function onPointerMove(event: React.PointerEvent<HTMLElement>) {
    const start = pointerRef.current;
    const engine = flipEngineRef.current;
    if (!start || !engine) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) < SWIPE_AXIS_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;

    event.preventDefault();
    const direction: Exclude<TmiFlipDirection, null> = dx < 0 ? "forward" : "backward";
    const peelOrigin = derivePeelOrigin(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect());
    const next = engine.setPreviewFromSwipe(Math.abs(dx), direction, peelOrigin);
    setSnapshot(next);
  }

  async function onPointerUp(event: React.PointerEvent<HTMLElement>) {
    const start = pointerRef.current;
    const engine = flipEngineRef.current;
    pointerRef.current = null;
    if (!start || !engine) return;

    const elapsedMs = Math.max(16, performance.now() - start.t);
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;

    if (Math.abs(dx) < SWIPE_AXIS_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    event.preventDefault();

    const direction: Exclude<TmiFlipDirection, null> = dx < 0 ? "forward" : "backward";
    const velocity = Math.abs(dx) / elapsedMs;
    const peelOrigin = derivePeelOrigin(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect());

    const next = await engine.applySwipe({
      velocity,
      distance: Math.abs(dx),
      direction,
      reducedMotion,
      peelOrigin,
    });
    setSnapshot(next);
  }

  if (!pages.length || !safeCurrentPage) {
    return (
      <section className={className}>
        <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/15 bg-black/70 p-6 text-white">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Magazine fallback</p>
          <h2 className="mt-2 text-lg font-black uppercase">Home 1 is loading</h2>
        </div>
      </section>
    );
  }

  return (
    <section
      className={className}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{ touchAction: "pan-y" }}
    >
      <div className={["relative h-full w-full overflow-hidden rounded-2xl border p-3 md:p-4", toneClass].join(" ")}>
        <TmiMagazineBackgroundLayer />
        <TmiMagazineUnderlayLayer />
        {enableCoverLoop && currentPage.route === "/home/1" ? (
          <TmiMagazineCoverLoop>
            <TmiMagazinePageSkeleton
              state={visualState}
              page={safeCurrentPage}
              presetId={snapshot.currentPage === 1 ? "home-1-2" : "home-1"}
              className="h-full"
            />
          </TmiMagazineCoverLoop>
        ) : (
          <TmiMagazinePageSkeleton
            state={visualState}
            page={safeCurrentPage}
            presetId={snapshot.currentPage === 1 ? "home-1-2" : "home-1"}
            className="h-full"
          />
        )}

        <div className="relative h-full rounded-xl p-3 pb-28 md:p-5 md:pb-32" style={{ zIndex: TMI_MAGAZINE_Z_INDEX.content }}>
          {!hideMetaPanel ? (
            <>
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-300">
                  {currentPage.pageType} · page {snapshot.currentPage + 1}/{pages.length}
                </p>
                <span className="rounded border border-cyan-300/35 bg-black/40 px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-cyan-100">
                  {visualState}
                </span>
              </div>
              <h2 className="text-lg font-black uppercase text-white">{safeCurrentPage.title}</h2>
              {safeCurrentPage.subtitle ? <p className="text-xs uppercase tracking-[0.12em] text-zinc-300">{safeCurrentPage.subtitle}</p> : null}
            </>
          ) : null}

          {visualState !== "closedIdle" && !embeddedContent ? (
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <article className="rounded border border-white/20 bg-black/45 p-2 text-[10px] uppercase tracking-[0.12em] text-zinc-200">
                Playlist block
              </article>
              <article className="rounded border border-white/20 bg-black/45 p-2 text-[10px] uppercase tracking-[0.12em] text-zinc-200">
                Article slot
              </article>
            </div>
          ) : null}

          {embeddedContent && !hideMetaPanel ? (
            <div className="mt-3 rounded-xl border border-white/20 bg-black/35 p-2 md:p-3">{embeddedContent}</div>
          ) : null}

          {snapshot.previewPageIndex !== snapshot.currentPage ? (
            <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-emerald-200">
              Preview: page {snapshot.previewPageIndex + 1}
            </p>
          ) : null}
        </div>

        {embeddedContent && hideMetaPanel ? (
          <div
            className="absolute left-1/2 top-1/2 h-[84%] w-[90%] -translate-x-1/2 -translate-y-1/2 overflow-hidden p-0"
            style={{ zIndex: TMI_MAGAZINE_Z_INDEX.content + 1 }}
          >
            {embeddedContent}
          </div>
        ) : null}

        <TmiMagazinePageCurl
          active={snapshot.isFlipping || snapshot.isOpening || snapshot.isClosing || snapshot.swipeDistance > 16 || visualState === "searchTransition"}
          direction={(snapshot.flipDirection || snapshot.swipeDirection) as TmiFlipDirection}
          peelOrigin={snapshot.peelOrigin}
          velocity={snapshot.swipeVelocity}
          reducedMotion={reducedMotion}
          visualState={visualState}
        />

        <PageTurnHinge
          active={snapshot.isFlipping || snapshot.isOpening || snapshot.isClosing || snapshot.swipeDistance > 16}
          direction={(snapshot.flipDirection || snapshot.swipeDirection) as TmiFlipDirection}
          peelOrigin={snapshot.peelOrigin}
          reducedMotion={reducedMotion}
        />

        <TmiMagazineOverlayLayer />
        <TmiMagazineInteractionLayer />

        {!reducedMotion && snapshot.visibleGhostPages.length > 0 ? (
          <div className="pointer-events-none absolute inset-0 z-[1]">
            {snapshot.visibleGhostPages.slice(0, 5).map((ghostPage, index) => (
              <div
                key={`ghost-${ghostPage}-${index}`}
                className="absolute inset-0 rounded-xl border border-white/10 bg-white/5"
                style={{
                  transform: `translateX(${(index + 1) * 4}px)`,
                  opacity: Math.max(0.12, 0.55 - index * 0.1),
                }}
              />
            ))}
          </div>
        ) : null}

        <div className="absolute bottom-2 left-2 right-2 z-[70] rounded-lg border border-white/20 bg-black/50 px-2 py-1 backdrop-blur-sm md:bottom-3 md:left-3 md:right-3">
          <TmiMagazineControls
            canGoBack={snapshot.canGoBack}
            canGoForward={snapshot.canGoForward}
            soundEnabled={soundEnabled}
            isOpen={isOpen}
            currentPage={snapshot.currentPage}
            totalPages={pages.length}
            onPrevious={() => void handlePrevious()}
            onNext={() => void handleNext()}
            onOpen={() => void handleOpen()}
            onClose={() => void handleClose()}
            onToggleMute={handleToggleMute}
            onJumpToFirst={() => void handleJumpToFirst()}
            onJumpToLast={() => void handleJumpToLast()}
            onJumpToPage={(page) => void handleJumpToPage(page)}
          />
        </div>
      </div>
    </section>
  );
}
