"use client";

import React, { useState, useCallback, useRef, useEffect, useMemo, createContext, useContext } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TIMING } from "@/lib/motion/timingRegistry";
import { prefersReducedMotion } from "@/lib/motion/reducedMotionGuard";
import { TmiMagazineAudioEngine } from "@/lib/magazine/tmiMagazineAudioEngine";
import { getSoundById } from "@/lib/sound/SoundManifest";
import GlitchOverlay from "@/components/motion/GlitchOverlay";
import CanonicalAdSlot from "@/components/ads/CanonicalAdSlot";
import { ARCHETYPES, type MagazineArchetype, type ArchetypeConfig } from "@/lib/magazine/MagazineDesignEngine";
import type { MagazinePageClass, RandomPageSubtype } from "@/lib/magazine/MagazineIssueContract";
import { MAGAZINE_XP_POLICY } from "@/lib/magazine/MagazineIssueContract";
import { getXpValue } from "@/lib/xp/XpActionRegistry";
import { MAGAZINE_ISSUE_1, type MagazineArticle } from "@/lib/magazine/magazineIssueData";
import MagazineArticleFocusOverlay from "@/components/magazine/MagazineArticleFocusOverlay";
import { TMI_CANVAS_MAX_WIDTH_PX, TMI_CANVAS_TOKENS } from "@/lib/magazine/TmiSurfaceParityEngine";

// Auto-advance interval in ms (10 seconds per spread)
const AUTO_ADVANCE_MS = 10_000;

// Minimum ms a user must stay on a spread before a manual turn earns XP (anti-farm)
const MIN_READ_MS = 5_000;

// Pages at this index and beyond require a subscription to read
const FREE_PAGE_THRESHOLD = 5;

// Half of the total slide duration — out then in
const PAGE_SLIDE_MS = TIMING.pageSlide;
const HALF_SLIDE = Math.floor(PAGE_SLIDE_MS / 2);

export interface MagazinePage {
  id: string;
  title: string;
  type: "cover" | "editorial" | "article" | "sponsor" | "chart" | "top10" | "interview";
  content: React.ReactNode;
  audioText?: string;
  pageClass?: MagazinePageClass;
  randomSubtype?: RandomPageSubtype;
  xpEligible?: boolean;
}

export interface MagazineReaderContextType {
  onSelectArticle: (slug: string) => void;
  activeArticleSlug: string | null;
  currentPageNumber: number;
}

export const MagazineReaderContext = createContext<MagazineReaderContextType>({
  onSelectArticle: () => {},
  activeArticleSlug: null,
  currentPageNumber: 1,
});

export function useMagazineReader() {
  return useContext(MagazineReaderContext);
}

export interface MagazineShellProps {
  pages: MagazinePage[];
  issue?: string;
  issueTitle?: string;
  initialLeftIndex?: number;
  initialArticleSlug?: string;
  onPageChange?: (page: MagazinePage, index: number) => void;
}

type FlipDirection = "forward" | "backward" | null;
type FlipPhase = "out" | "snap" | "in" | null;

const TYPE_COLOR: Record<MagazinePage["type"], string> = {
  cover:     "#00FFFF",
  editorial: "#00FF88",
  article:   "#FF2DAA",
  sponsor:   "#FFD700",
  chart:     "#AA2DFF",
  top10:     "#FFD700",
  interview: "#00FFFF",
};

function TypeBadge({ type, colorOverride, pageClass }: { type: MagazinePage["type"]; colorOverride?: string; pageClass?: MagazinePageClass }) {
  const color = colorOverride || TYPE_COLOR[type];
  return (
    <div style={{ marginBottom: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
      {pageClass ? (
        <span style={{
          fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase",
          color, border: `1px solid ${color}40`, borderRadius: 4, padding: "2px 7px", fontWeight: 800,
        }}>
          {pageClass}
        </span>
      ) : null}
      <span style={{
        fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase",
        color, border: `1px solid ${color}40`, borderRadius: 4, padding: "2px 7px", fontWeight: 800,
      }}>
        {type}
      </span>
    </div>
  );
}

function PagePane({ page, archetype }: { page: MagazinePage; archetype: ArchetypeConfig }) {
  const background = archetype.leftPageBg;

  return (
    <div
      style={{
        flex: 1,
        width: "100%",
        minHeight: "75vh",
        padding: "28px 28px 48px",
        position: "relative",
        background,
        overflow: "visible",
        fontFamily: archetype.fontFamily,
        transition: "background 0.3s ease, border-color 0.3s ease",
        boxSizing: "border-box",
      }}
    >
      {/* Tactile Page Sheen/Glow */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%, rgba(0,0,0,0.05) 100%)", pointerEvents: "none", zIndex: 4 }} />

      <TypeBadge type={page.type} colorOverride={archetype.accentColor} pageClass={page.pageClass} />

      <div style={{ position: "relative", zIndex: 6, width: "100%", touchAction: "pan-y" }} data-magazine-page-body>
        {page.content}
      </div>

      {page.type === "sponsor" && (
        <div aria-hidden="true" style={{ position: "absolute", top: 0, right: 0, width: 4, height: "100%", background: `linear-gradient(to bottom, ${archetype.accentColor}, transparent)`, pointerEvents: "none" }} />
      )}
      {page.type === "cover" && (
        <GlitchOverlay active intensity="subtle" showScanlines />
      )}
    </div>
  );
}

function LockedSpreadModal({ onBack }: { onBack: () => void }) {
  return (
    <div
      aria-modal="true"
      role="dialog"
      aria-label="Premium content — subscription required"
      style={{
        position: "absolute", inset: 0, zIndex: 20,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(5,5,16,0.92)",
        backdropFilter: "blur(12px)",
        borderRadius: 14,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 360, padding: "32px 24px" }}>
        <div style={{ fontSize: 40, marginBottom: 18 }}>🔒</div>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FF2DAA", fontWeight: 800, marginBottom: 10 }}>MEMBERS ONLY</div>
        <h2 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 12px", lineHeight: 1.2 }}>
          This page is behind the paywall
        </h2>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, margin: "0 0 24px" }}>
          Subscribe to The Musician&apos;s Index to unlock all issues, exclusive interviews, and artist charts.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/pricing?ref=magazine"
            style={{ padding: "10px 22px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#050510", background: "linear-gradient(135deg,#FF2DAA,#AA2DFF)", borderRadius: 8, textDecoration: "none" }}
          >
            SUBSCRIBE →
          </Link>
          <button
            onClick={onBack}
            style={{ padding: "10px 18px", fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, cursor: "pointer" }}
          >
            ← GO BACK
          </button>
        </div>
        <div style={{ marginTop: 16 }}>
          <Link href="/login" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "underline" }}>
            Already a subscriber? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MagazineShell({
  pages,
  issue = "001",
  issueTitle = "TMI Magazine",
  initialLeftIndex = 0,
  initialArticleSlug,
  onPageChange,
}: MagazineShellProps) {
  const router = useRouter();
  const normalizeStartIndex = useCallback((index: number) => {
    if (!Number.isFinite(index)) return 0;
    if (index <= 0) return 0;
    const max = Math.max(0, pages.length - 1);
    return Math.min(max, Math.floor(index));
  }, [pages.length]);

  const [currentLeft, setCurrentLeft] = useState(() => normalizeStartIndex(initialLeftIndex));
  const [activeArticleSlug, setActiveArticleSlug] = useState<string | null>(initialArticleSlug ?? null);
  const [flipping, setFlipping] = useState<FlipDirection>(null);
  const [flipPhase, setFlipPhase] = useState<FlipPhase>(null);
  const [isWide, setIsWide] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isDiamond, setIsDiamond] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);
  const [xpToast, setXpToast] = useState<{ amount: number } | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [pageAudioEnabled, setPageAudioEnabled] = useState(true);
  const [activeArchetype, setActiveArchetype] = useState<MagazineArchetype>("vibe");
  const [showResumeModal, setShowResumeModal] = useState<number | null>(null);

  const archetype = ARCHETYPES[activeArchetype];
  const reduced = prefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const justSwipedRef = useRef(false);
  const audioRef = useRef<TmiMagazineAudioEngine | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const xpToastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageEntryTimeRef = useRef<number>(Date.now());
  const leavingEligibleRef = useRef(false);
  const leavingPageIdRef = useRef("");
  const grantedPageIdsRef = useRef(new Set<string>());
  const stateRef = useRef({ currentLeft, flipping, flipPhase, isWide });
  stateRef.current = { currentLeft, flipping, flipPhase, isWide };

  // Article selection / focus overlay handlers
  const handleSelectArticle = useCallback((slug: string) => {
    setActiveArticleSlug(slug);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("article", slug);
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const handleCloseArticle = useCallback(() => {
    setActiveArticleSlug(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("article");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const activeArticle = useMemo(() => {
    if (!activeArticleSlug) return null;
    return (
      MAGAZINE_ISSUE_1.find((a) => a.slug === activeArticleSlug) || {
        slug: activeArticleSlug,
        title: activeArticleSlug.replace(/-/g, " ").toUpperCase(),
        subtitle: "Exclusive Editorial Feature from The Musician's Index",
        author: "TMI Editorial",
        publishedAt: "2026-04-01",
        category: "feature" as const,
        tags: ["feature"],
        heroColor: "#FFD700",
        icon: "👑",
        blocks: [
          {
            type: "paragraph" as const,
            text: "This story is featured inside the current issue of The Musician's Index. Scroll down for complete editorial narrative, media player, and fan community discussion.",
          },
        ],
      }
    );
  }, [activeArticleSlug]);

  useEffect(() => {
    if (initialArticleSlug) {
      setActiveArticleSlug(initialArticleSlug);
    }
  }, [initialArticleSlug]);

  useEffect(() => {
    leavingEligibleRef.current = Boolean(pages[currentLeft]?.xpEligible);
    leavingPageIdRef.current = pages[currentLeft]?.id ?? "";
  }, [pages, currentLeft]);

  useEffect(() => {
    setCurrentLeft(normalizeStartIndex(initialLeftIndex));
  }, [initialLeftIndex, normalizeStartIndex]);

  // Read bookmark on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const bookmark = window.localStorage.getItem(`tmi_magazine_bookmark_${issue}`);
      if (bookmark) {
        const val = parseInt(bookmark, 10);
        if (val > 0 && val < pages.length) {
          setShowResumeModal(val);
        }
      }
    }
  }, [pages.length, issue]);

  // Write bookmark on change
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(`tmi_magazine_bookmark_${issue}`, currentLeft.toString());
    }
  }, [currentLeft, issue]);

  // Boot audio engine with real paper page-turn sounds
  useEffect(() => {
    const audio = new TmiMagazineAudioEngine({
      pageTurn: getSoundById("magazine_page_turn")?.file ?? null,
      pagesTurning: getSoundById("magazine_pages_turning")?.file ?? null,
      pageOpen: "/sounds/ui/ui-menu-pack.mp3",
      pageClose: "/sounds/ui/ui-menu-pack.mp3",
      softSwipe: getSoundById("magazine_page_turn")?.file ?? null,
    });
    audioRef.current = audio;
    setPageAudioEnabled(audio.soundEnabled);
    // Rule 37 — stop any in-flight page-turn sound rather than leaving it as
    // an orphaned <audio> element when the reader unmounts (close/navigate away).
    return () => {
      audio.dispose();
    };
  }, []);

  // Resolve subscription entitlement from session
  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store", credentials: "include" })
      .then(r => r.json())
      .then((d: unknown) => {
        if (!active) return;
        const data = d as { authenticated?: boolean; user?: { id?: string; role?: string; tier?: string } | null };
        const authed = Boolean(data?.authenticated);
        const role   = data?.user?.role ?? "";
        const tier   = data?.user?.tier ?? "";
        const paid   = role === "admin" || role === "artist" || role === "sponsor" ||
                       role === "superadmin" || role === "owner";
        setIsSubscribed(authed && paid);
        setIsDiamond(tier.toLowerCase() === "diamond");
        setUserId(authed ? (data?.user?.id ?? null) : null);
      })
      .catch(() => { /* stays false — free user path */ });
    return () => { active = false; };
  }, []);

  // Detect wide screen
  useEffect(() => {
    function check() { setIsWide(window.innerWidth >= 900); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Compute all individual page indices (1 page per spread canvas)
  const spreadStarts = useMemo(() => {
    return pages.map((_, i) => i);
  }, [pages]);

  const currentSpreadIdx = currentLeft;
  const isFirst  = currentSpreadIdx === 0;
  const isLast   = currentSpreadIdx === spreadStarts.length - 1;
  const isLocked = !isSubscribed && currentLeft >= FREE_PAGE_THRESHOLD;

  function goBackToFree() {
    const lastFreeStart = spreadStarts.filter(s => s < FREE_PAGE_THRESHOLD).at(-1) ?? 0;
    goToSpread(lastFreeStart, "backward");
  }

  const leftPage = pages[currentLeft] || pages[0];

  const stopAudio = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (utteranceRef.current) utteranceRef.current = null;
    setAudioPlaying(false);
  }, []);

  // Grant XP after dwell on eligible page
  const grantReadXP = useCallback(() => {
    if (MAGAZINE_XP_POLICY.pageOpenDoesNotGrant && !leavingEligibleRef.current) return;
    const elapsed = Date.now() - pageEntryTimeRef.current;
    if (elapsed < MIN_READ_MS) return;
    const pageId = leavingPageIdRef.current;
    if (!pageId || grantedPageIdsRef.current.has(pageId)) return;
    if (!userId) return;
    grantedPageIdsRef.current.add(pageId);
    void fetch("/api/magazine/read-xp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ pageId }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((result: { ok?: boolean; granted?: number } | null) => {
        const granted = result?.granted ?? 0;
        if (!result?.ok || granted <= 0) return;
        if (xpToastTimerRef.current) clearTimeout(xpToastTimerRef.current);
        setXpToast({ amount: granted });
        xpToastTimerRef.current = setTimeout(() => setXpToast(null), 3000);
      })
      .catch(() => {
        grantedPageIdsRef.current.delete(pageId);
      });
  }, [userId]);

  // Page navigation authority with distinct single vs multi-page sounds
  const goToSpread = useCallback((leftIdx: number, dir: FlipDirection, turnSource: "manual" | "auto" = "manual") => {
    if (stateRef.current.flipping) return;
    const jumpDistance = Math.abs(leftIdx - stateRef.current.currentLeft);

    if (reduced) {
      setCurrentLeft(leftIdx);
      onPageChange?.(pages[leftIdx], leftIdx);
      return;
    }

    stopAudio();

    // Sound engine authority: single turn vs multi-page jump
    if (jumpDistance > 1) {
      audioRef.current?.playPagesTurning();
    } else {
      audioRef.current?.playPageTurn();
    }

    setFlipping(dir);
    setFlipPhase("out");
    if (turnSource === "manual") grantReadXP();
    pageEntryTimeRef.current = Date.now();

    window.setTimeout(() => {
      setCurrentLeft(leftIdx);
      setFlipPhase("snap");
      onPageChange?.(pages[leftIdx], leftIdx);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFlipPhase("in");

          window.setTimeout(() => {
            setFlipping(null);
            setFlipPhase(null);
          }, HALF_SLIDE);
        });
      });
    }, HALF_SLIDE);
  }, [reduced, pages, onPageChange, grantReadXP, stopAudio]);

  const goNext = useCallback((turnSource: "manual" | "auto" = "manual") => {
    const { currentLeft: cl, flipping: f } = stateRef.current;
    if (f) return;
    if (cl + 1 < pages.length) {
      goToSpread(cl + 1, "forward", turnSource);
    }
  }, [pages.length, goToSpread]);

  const goPrev = useCallback(() => {
    const { currentLeft: cl, flipping: f } = stateRef.current;
    if (f) return;
    if (cl - 1 >= 0) {
      goToSpread(cl - 1, "backward", "manual");
    }
  }, [goToSpread]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (activeArticleSlug) return; // let modal handle keys
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft")  goPrev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, activeArticleSlug]);

  const toggleAudio = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (audioPlaying) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
      setAudioPlaying(false);
      return;
    }
    const currentPage = pages[currentLeft];
    const text = currentPage?.audioText ?? currentPage?.title ?? "";
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.onend = () => { utteranceRef.current = null; setAudioPlaying(false); };
    utterance.onerror = () => { utteranceRef.current = null; setAudioPlaying(false); };
    utteranceRef.current = utterance;
    setAudioPlaying(true);
    window.speechSynthesis.speak(utterance);
  }, [audioPlaying, pages, currentLeft]);

  // Rule 37 — page-turn paper sound mute toggle (distinct from Read Aloud above).
  const togglePageAudio = useCallback(() => {
    if (!audioRef.current) return;
    setPageAudioEnabled(audioRef.current.toggleMute());
  }, []);

  // Auto-advance loop
  useEffect(() => {
    if (!autoPlay || hovering || isLast || flipping) return;
    autoTimerRef.current = setInterval(() => {
      goNext("auto");
    }, AUTO_ADVANCE_MS);
    return () => { if (autoTimerRef.current) clearInterval(autoTimerRef.current); };
  }, [autoPlay, hovering, isLast, flipping, goNext]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      justSwipedRef.current = true;
      window.setTimeout(() => { justSwipedRef.current = false; }, 380);
      if (dx < 0) goNext();
      else goPrev();
    }
  }

  let flipTransform = "translateX(0)";
  let flipTransition: string | undefined =
    `transform ${PAGE_SLIDE_MS}ms cubic-bezier(0.4,0,0.2,1), opacity ${PAGE_SLIDE_MS * 0.55}ms ease`;
  let flipOpacity = 1;

  if (!reduced && flipping) {
    if (flipPhase === "out") {
      flipTransform = flipping === "forward" ? "translateX(-36px)" : "translateX(36px)";
      flipTransition = `transform ${HALF_SLIDE}ms cubic-bezier(0.55,0,1,1), opacity ${HALF_SLIDE}ms ease-in`;
      flipOpacity = 0.12;
    } else if (flipPhase === "snap") {
      flipTransform = flipping === "forward" ? "translateX(36px)" : "translateX(-36px)";
      flipTransition = "none";
      flipOpacity = 0;
    } else if (flipPhase === "in") {
      flipTransform = "translateX(0)";
      flipTransition = `transform ${HALF_SLIDE}ms cubic-bezier(0,0,0.3,1), opacity ${HALF_SLIDE}ms ease-out`;
      flipOpacity = 1;
    }
  }

  const edgeColor = archetype.accentColor;
  const pageStack = !reduced
    ? `3px 5px 0 1px rgba(10,10,22,0.85), 6px 9px 0 2px rgba(10,10,22,0.68), 9px 13px 0 3px rgba(10,10,22,0.5)`
    : "";
  const edgeGlow = !reduced
    ? `0 0 18px ${edgeColor}22, 0 0 36px ${edgeColor}0e`
    : "";
  const baseShad = "0 8px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)";
  const spreadBoxShadow = [baseShad, pageStack, edgeGlow].filter(Boolean).join(", ");

  const foldShadowVisible = !reduced && !!flipping && flipPhase !== null;
  const foldShadowOpacity = flipPhase === "out" ? 1 : flipPhase === "in" ? 0.2 : 0;
  const foldShadowBg = flipping === "forward"
    ? "linear-gradient(to left, rgba(0,0,0,0.72) 0%, transparent 55%)"
    : "linear-gradient(to right, rgba(0,0,0,0.72) 0%, transparent 55%)";
  const foldShadowTransition = flipPhase === "snap"
    ? "none"
    : `opacity ${HALF_SLIDE}ms ease`;

  return (
    <MagazineReaderContext.Provider
      value={{
        onSelectArticle: handleSelectArticle,
        activeArticleSlug,
        currentPageNumber: currentLeft + 1,
      }}
    >
      <div
        data-testid="magazine-shell"
        aria-label="TMI Magazine"
        style={{
          minHeight: "100vh",
          maxWidth: "100vw",
          width: "100%",
          overflowX: "hidden",
          paddingTop: 56,
          background: "linear-gradient(160deg, #0a0014 0%, #020617 60%, #0a0a0f 100%)",
          color: "#e2e8f0",
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          position: "relative",
          boxSizing: "border-box",
        }}
      >
        <style>{`
          .tmi-mag-title {
            font-family: ${archetype.headerFont} !important;
            color: ${archetype.titleStyle.color} !important;
            text-shadow: ${archetype.titleStyle.textShadow ?? "none"} !important;
            letter-spacing: ${archetype.titleStyle.letterSpacing ?? "normal"} !important;
            text-transform: ${archetype.titleStyle.textTransform ?? "none"} !important;
            margin-top: 4px !important;
          }
          .tmi-mag-paragraph {
            font-family: ${archetype.fontFamily} !important;
            color: ${archetype.paragraphStyle.color} !important;
            line-height: ${archetype.paragraphStyle.lineHeight} !important;
            font-size: ${archetype.paragraphStyle.fontSize}px !important;
          }
          .tmi-mag-pullquote {
            font-family: ${archetype.pullQuoteStyle.fontFamily ?? "inherit"} !important;
            font-size: ${archetype.pullQuoteStyle.fontSize}px !important;
            color: ${archetype.pullQuoteStyle.color} !important;
            font-style: ${archetype.pullQuoteStyle.fontStyle ?? "italic"} !important;
            border-left: ${archetype.pullQuoteStyle.borderLeft ?? "none"} !important;
            border-top: ${archetype.pullQuoteStyle.borderTop ?? "none"} !important;
            border-bottom: ${archetype.pullQuoteStyle.borderBottom ?? "none"} !important;
            padding: ${archetype.pullQuoteStyle.padding ?? "0 0 0 8px"} !important;
            text-transform: ${archetype.pullQuoteStyle.textTransform ?? "none"} !important;
          }
          .tmi-mag-shell-container {
            width: 100%;
            max-width: 100%;
            overflow-x: hidden;
            box-sizing: border-box;
          }
          @media (max-width: 767px) {
            .tmi-mag-shell-canvas {
              padding: 12px 6px !important;
            }
            .tmi-mag-cols {
              column-count: 1 !important;
            }
            .tmi-mag-shell-container,
            .tmi-mag-shell-canvas,
            [data-testid^="magazine-page-"] {
              max-width: 100vw !important;
              width: 100% !important;
              overflow-x: hidden !important;
              box-sizing: border-box !important;
            }
          }
          .tmi-mag-dropcap::first-letter {
            font-family: ${archetype.headerFont} !important;
            font-size: 3.2em !important;
            float: left !important;
            line-height: 0.82 !important;
            margin-right: 6px !important;
            color: ${archetype.dropCapColor} !important;
            font-weight: 900 !important;
            text-shadow: 1px 1px 0px rgba(0,0,0,0.5) !important;
          }
        `}</style>

        {/* Resume Modal */}
        {showResumeModal !== null && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(5,5,16,0.94)", backdropFilter: "blur(16px)",
          }}>
            <div style={{ textAlign: "center", maxWidth: 360, padding: 24, border: `1.5px solid ${archetype.borderColor}`, borderRadius: 12, background: "rgba(10,10,24,0.8)", boxShadow: "0 10px 30px rgba(0,0,0,0.8)" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📖</div>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: archetype.accentColor, fontWeight: 900, marginBottom: 8 }}>WELCOME BACK</div>
              <h3 style={{ fontSize: 16, fontWeight: 900, color: "#fff", margin: "0 0 10px" }}>Resume Reading?</h3>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginBottom: 20 }}>
                You left off on page {showResumeModal + 1} during your last session.
              </p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                <button
                  onClick={() => {
                    setCurrentLeft(showResumeModal);
                    setShowResumeModal(null);
                  }}
                  style={{ padding: "8px 18px", fontSize: 10, fontWeight: 800, color: "#050510", background: archetype.accentColor, border: "none", borderRadius: 6, cursor: "pointer" }}
                >
                  RESUME PAGE {showResumeModal + 1}
                </button>
                <button
                  onClick={() => {
                    setShowResumeModal(null);
                  }}
                  style={{ padding: "8px 18px", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, cursor: "pointer" }}
                >
                  START OVER
                </button>
              </div>
            </div>
          </div>
        )}

        {xpToast && (
          <div
            aria-live="polite"
            style={{
              position: "fixed",
              bottom: 80,
              right: 24,
              zIndex: 999,
              background: "linear-gradient(135deg,#00FF88,#00C8FF)",
              color: "#050510",
              padding: "10px 18px",
              borderRadius: 10,
              fontWeight: 900,
              fontSize: 12,
              letterSpacing: "0.08em",
              boxShadow: "0 4px 24px rgba(0,255,136,0.4)",
              animation: "fadeInUp 0.25s ease",
            }}
          >
            +{xpToast.amount} XP — keep reading to earn more!
          </div>
        )}

        {/* Masthead */}
        <header style={{
          padding: "12px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          borderBottom: "1px solid rgba(0,255,255,0.1)",
          background: "rgba(5,5,16,0.8)",
          backdropFilter: "blur(8px)",
          flexWrap: "wrap",
          zIndex: 50,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              onClick={() => {
                const origin = typeof window !== "undefined" ? sessionStorage.getItem("tmi_magazine_origin") : null;
                if (origin && origin !== "/magazine/issue/current") {
                  router.push(origin);
                } else {
                  router.push("/hub/performer");
                }
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,45,170,0.18)",
                border: "1px solid #FF2DAA",
                borderRadius: 8,
                color: "#FF2DAA",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.08em",
                padding: "6px 14px",
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 0 10px rgba(255,45,170,0.3)",
              }}
            >
              <span>←</span>
              <span>EXIT TO HUB</span>
            </button>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 8, letterSpacing: "0.4em", color: archetype.accentColor, fontWeight: 800, textTransform: "uppercase" }}>
                {issueTitle}
              </span>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em" }}>
                Issue #{issue} — Fall 2026
              </span>
            </div>
          </div>

          {/* Dynamic Theme Picker */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 800 }}>THEME STYLE:</span>
            <select
              value={activeArchetype}
              onChange={(e) => setActiveArchetype(e.target.value as MagazineArchetype)}
              style={{
                background: "rgba(5,5,16,0.6)",
                border: `1px solid ${archetype.borderColor}`,
                borderRadius: 6,
                color: "#fff",
                fontSize: 9,
                fontWeight: 800,
                padding: "4px 10px",
                cursor: "pointer",
                outline: "none",
              }}
            >
              {Object.values(ARCHETYPES).map((arch) => (
                <option key={arch.id} value={arch.id} style={{ background: "#050510", color: "#fff" }}>
                  {arch.name}
                </option>
              ))}
            </select>
          </div>

          {/* XP earn notice */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)",
            borderRadius: 20, padding: "4px 12px",
          }}>
            <span style={{ fontSize: 13 }}>⭐</span>
            <span style={{ fontSize: 9, color: "#00FF88", fontWeight: 800, letterSpacing: "0.06em" }}>
              +{getXpValue(MAGAZINE_XP_POLICY.xpActionKey)} XP per page · read to progress
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              onClick={() => setAutoPlay(p => !p)}
              title={autoPlay ? "Pause auto-advance" : "Resume auto-advance"}
              style={{
                background: "transparent",
                border: `1px solid ${autoPlay ? archetype.accentColor : "rgba(255,255,255,0.15)"}`,
                borderRadius: 6,
                color: autoPlay ? archetype.accentColor : "rgba(255,255,255,0.3)",
                fontSize: 14,
                lineHeight: 1,
                padding: "4px 8px",
                cursor: "pointer",
              }}
              aria-label={autoPlay ? "Pause auto-advance" : "Resume auto-advance"}
            >
              {autoPlay ? "⏸" : "▶"}
            </button>

            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 700 }}>
              Page {currentLeft + 1} of {pages.length}
            </div>
          </div>
        </header>

        {/* Page canvas with Parity Width & Bokeh Blur on article focus */}
        <div
          ref={containerRef}
          className="tmi-mag-shell-canvas"
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "24px 20px",
            touchAction: "pan-y",
            filter: activeArticleSlug ? "blur(14px) brightness(0.65)" : "none",
            transition: "filter 0.3s ease",
            boxSizing: "border-box",
          }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={(e) => { if (justSwipedRef.current) { e.preventDefault(); e.stopPropagation(); } }}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          {!reduced && !flipping && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 24,
                borderRadius: 14,
                pointerEvents: "none",
                boxShadow: `inset 0 0 0 1px ${edgeColor}14`,
                transition: `box-shadow ${TIMING.slow}ms ease`,
              }}
            />
          )}

          {/* Canonical surface parity container: maxWidth 1040px matches Performer Profile */}
          <div
            data-testid={`magazine-page-${leftPage?.id}`}
            style={{
              width: "100%",
              minHeight: "75vh",
              maxWidth: TMI_CANVAS_MAX_WIDTH_PX,
              margin: "0 auto",
              boxSizing: "border-box",
              overflowX: "hidden",
              position: "relative",
              transition: reduced ? undefined : flipTransition,
              transform: flipTransform,
              opacity: flipOpacity,
              willChange: "transform, opacity",
              borderRadius: 14,
              border: `1.5px solid ${archetype.borderColor}`,
              background: "rgba(10, 0, 20, 0.75)",
              display: "block",
              overflow: "hidden",
              boxShadow: spreadBoxShadow,
            }}
          >
            <PagePane page={leftPage} archetype={archetype} />

            {isLocked && <LockedSpreadModal onBack={goBackToFree} />}

            {/* Fold shadow */}
            {foldShadowVisible && (
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 14,
                  background: foldShadowBg,
                  opacity: foldShadowOpacity,
                  transition: foldShadowTransition,
                  pointerEvents: "none",
                  zIndex: 12,
                }}
              />
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Magazine navigation"
          style={{
            padding: "14px 28px",
            borderTop: "1px solid rgba(0,255,255,0.1)",
            display: "flex",
            gap: 14,
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(5,5,16,0.85)",
            backdropFilter: "blur(8px)",
            flexWrap: "wrap",
          }}
        >
          <button
            data-testid="magazine-prev"
            type="button"
            aria-label="Previous page"
            disabled={isFirst || !!flipping}
            onClick={goPrev}
            style={{
              border: `1px solid ${isFirst ? "rgba(255,255,255,0.1)" : archetype.borderColor}`,
              borderRadius: 8,
              background: "transparent",
              color: isFirst ? "#1e293b" : archetype.accentColor,
              padding: "8px 20px",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.12em",
              cursor: isFirst ? "not-allowed" : "pointer",
              transition: `all ${TIMING.fast}ms ease`,
            }}
          >
            ← PREV
          </button>

          {/* Spread dots: 1 dot per physical page */}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {spreadStarts.map((start, i) => {
              const active = i === currentSpreadIdx;
              return (
                <button
                  key={start}
                  data-testid={`magazine-dot-${i}`}
                  type="button"
                  onClick={() => goToSpread(start, start > currentLeft ? "forward" : "backward", "manual")}
                  style={{
                    width: active ? 22 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: active ? archetype.accentColor : "rgba(255,255,255,0.2)",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    transition: `all ${TIMING.fast}ms ease`,
                  }}
                  aria-label={`Go to page ${i + 1}`}
                />
              );
            })}
          </div>

          {/* Read Aloud button */}
          {leftPage?.audioText && (
            <button
              type="button"
              onClick={toggleAudio}
              aria-label={audioPlaying ? "Stop listening" : "Listen to this page"}
              title={audioPlaying ? "Stop audio" : "🎙️ Read Aloud"}
              style={{
                border: `1px solid ${audioPlaying ? "#FF2DAA" : archetype.borderColor}`,
                borderRadius: 8,
                background: audioPlaying
                  ? "rgba(255,45,170,0.12)"
                  : "rgba(5,5,16,0.6)",
                color: audioPlaying ? "#FF2DAA" : archetype.accentColor,
                padding: "8px 18px",
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.1em",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: audioPlaying ? `0 0 14px ${archetype.accentColor}44` : "none",
                transition: `all ${TIMING.fast}ms ease`,
              }}
            >
              <span style={{ fontSize: 13, animation: audioPlaying ? "tmiPulse 1.2s infinite" : "none" }}>🎙️</span>
              <span>{audioPlaying ? "STOP READING" : "READ ALOUD"}</span>
            </button>
          )}

          {/* Rule 37 — page-turn paper sound mute toggle */}
          <button
            data-testid="magazine-page-audio-toggle"
            type="button"
            onClick={togglePageAudio}
            aria-label={pageAudioEnabled ? "Mute page-turn sound" : "Unmute page-turn sound"}
            title={pageAudioEnabled ? "Mute page-turn sound" : "Unmute page-turn sound"}
            style={{
              border: `1px solid ${archetype.borderColor}`,
              borderRadius: 8,
              background: "rgba(5,5,16,0.6)",
              color: archetype.accentColor,
              padding: "8px 12px",
              fontSize: 13,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              transition: `all ${TIMING.fast}ms ease`,
            }}
          >
            {pageAudioEnabled ? "🔊" : "🔇"}
          </button>

          <button
            data-testid="magazine-next"
            type="button"
            aria-label="Next page"
            disabled={isLast || !!flipping}
            onClick={() => goNext("manual")}
            style={{
              border: `1px solid ${isLast ? "rgba(255,255,255,0.1)" : archetype.borderColor}`,
              borderRadius: 8,
              background: "transparent",
              color: isLast ? "#1e293b" : archetype.accentColor,
              padding: "8px 20px",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.12em",
              cursor: isLast ? "not-allowed" : "pointer",
              transition: `all ${TIMING.fast}ms ease`,
            }}
          >
            NEXT →
          </button>
        </nav>

        {/* Bottom ad leaderboard */}
        {!isDiamond && (
          <div style={{
            padding: "6px 24px 12px",
            background: "rgba(5,5,16,0.95)",
            borderTop: `1px solid ${archetype.borderColor}40`,
            boxShadow: `0 -4px 16px rgba(0,0,0,0.2)`,
          }}>
            <CanonicalAdSlot
              slotId="magazine-leaderboard"
              venue="magazine"
              style={{ minHeight: 60, maxWidth: 900, margin: "0 auto", border: `1px dashed ${archetype.borderColor}55`, padding: 8, borderRadius: 6 }}
            />
          </div>
        )}

        {isWide && !isDiamond && (
          <div
            aria-label="Advertisement"
            style={{
              position: "fixed",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              width: 160,
              zIndex: 80,
              pointerEvents: "auto",
            }}
          >
            <CanonicalAdSlot
              slotId="magazine-sponsor-sidebar"
              venue="magazine"
              style={{ minHeight: 280 }}
            />
          </div>
        )}

        {/* Canonical In-Context Article Focus Overlay (Ricardo Parker Reference) */}
        {activeArticle && (
          <MagazineArticleFocusOverlay
            article={activeArticle}
            isOpen={Boolean(activeArticleSlug)}
            onClose={handleCloseArticle}
            onSelectRelatedArticle={handleSelectArticle}
            originatingPageNumber={currentLeft + 1}
          />
        )}
      </div>
    </MagazineReaderContext.Provider>
  );
}
