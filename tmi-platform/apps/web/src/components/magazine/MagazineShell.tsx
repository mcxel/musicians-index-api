"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { TIMING } from "@/lib/motion/timingRegistry";
import { prefersReducedMotion } from "@/lib/motion/reducedMotionGuard";
import { TmiMagazineAudioEngine } from "@/lib/magazine/tmiMagazineAudioEngine";
import GlitchOverlay from "@/components/motion/GlitchOverlay";

// Pages at this index and beyond require a subscription to read
const FREE_PAGE_THRESHOLD = 4;

// Half of the total flip duration — one half for "curl away", one for "curl in"
const HALF_FLIP = Math.floor(TIMING.pageFlip / 2);

export interface MagazinePage {
  id: string;
  title: string;
  type: "cover" | "editorial" | "article" | "sponsor" | "chart" | "top10" | "interview";
  content: React.ReactNode;
}

interface MagazineShellProps {
  pages: MagazinePage[];
  issue?: string;
  issueTitle?: string;
  initialLeftIndex?: number;
  onPageChange?: (page: MagazinePage, index: number) => void;
}

type FlipDirection = "forward" | "backward" | null;
// "out"  → active page curls to 90° (edge-on), fades to zero
// "snap" → content changes instantly at edge-on, no CSS transition
// "in"   → new page uncurls from 90° back to 0°, fades in
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

function TypeBadge({ type }: { type: MagazinePage["type"] }) {
  const color = TYPE_COLOR[type];
  return (
    <div style={{ marginBottom: 10 }}>
      <span style={{
        fontSize: 8, letterSpacing: "0.18em", textTransform: "uppercase",
        color, border: `1px solid ${color}40`, borderRadius: 4, padding: "2px 7px", fontWeight: 800,
      }}>
        {type}
      </span>
    </div>
  );
}

function PagePane({ page, side }: { page: MagazinePage; side?: "left" | "right" | "solo" }) {
  const isLeft  = side === "left";
  const isRight = side === "right";

  return (
    <div
      style={{
        flex: 1,
        minHeight: 520,
        padding: "20px 22px",
        position: "relative",
        background: side === "solo" ? "rgba(255,255,255,0.02)" : undefined,
        borderRight: isLeft  ? "1px solid rgba(0,0,0,0.6)" : undefined,
        borderLeft:  isRight ? "1px solid rgba(255,255,255,0.04)" : undefined,
        overflow: "hidden",
      }}
    >
      {/* Spine shadows */}
      {isLeft && (
        <div aria-hidden="true" style={{ position: "absolute", right: 0, top: 0, width: 32, height: "100%", background: "linear-gradient(to right, transparent, rgba(0,0,0,0.35))", pointerEvents: "none" }} />
      )}
      {isRight && (
        <div aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, width: 32, height: "100%", background: "linear-gradient(to left, transparent, rgba(0,0,0,0.35))", pointerEvents: "none" }} />
      )}
      <TypeBadge type={page.type} />
      {page.content}
      {page.type === "sponsor" && (
        <div aria-hidden="true" style={{ position: "absolute", top: 0, right: 0, width: 4, height: "100%", background: "linear-gradient(to bottom, #FFD700, #FFD70000)", pointerEvents: "none" }} />
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
        background: "rgba(5,5,16,0.88)",
        backdropFilter: "blur(12px)",
        borderRadius: 10,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 360, padding: "32px 24px" }}>
        <div style={{ fontSize: 40, marginBottom: 18 }}>🔒</div>
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "#FF2DAA", fontWeight: 800, marginBottom: 10 }}>MEMBERS ONLY</div>
        <h2 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 12px", lineHeight: 1.2 }}>
          This spread is behind the paywall
        </h2>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, margin: "0 0 24px" }}>
          Subscribe to The Musician&apos;s Index to unlock all issues, exclusive interviews, and artist charts.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/checkout"
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
  onPageChange,
}: MagazineShellProps) {
  const normalizeStartIndex = useCallback((index: number) => {
    if (!Number.isFinite(index)) return 0;
    if (index <= 0) return 0;
    const max = Math.max(0, pages.length - 1);
    const clamped = Math.min(max, Math.floor(index));
    return clamped % 2 === 0 ? Math.max(1, clamped - 1) : clamped;
  }, [pages.length]);

  const [currentLeft, setCurrentLeft] = useState(() => normalizeStartIndex(initialLeftIndex));
  const [flipping, setFlipping] = useState<FlipDirection>(null);
  const [flipPhase, setFlipPhase] = useState<FlipPhase>(null);
  const [isWide, setIsWide] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const reduced = prefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const audioRef = useRef<TmiMagazineAudioEngine | null>(null);
  const stateRef = useRef({ currentLeft, flipping, flipPhase, isWide });
  stateRef.current = { currentLeft, flipping, flipPhase, isWide };

  useEffect(() => {
    setCurrentLeft(normalizeStartIndex(initialLeftIndex));
  }, [initialLeftIndex, normalizeStartIndex]);

  // Boot audio engine once
  useEffect(() => {
    audioRef.current = new TmiMagazineAudioEngine();
  }, []);

  // Resolve subscription entitlement from session
  // Unlocked roles: admin, artist, sponsor (platform partners + staff)
  // Fan tier: free preview only — Copilot: replace role check with subscriptionTier field
  //   when API returns it (pro | bronze | gold | platinum | diamond | season-pass)
  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { cache: "no-store", credentials: "include" })
      .then(r => r.json())
      .then((d: unknown) => {
        if (!active) return;
        const data = d as { authenticated?: boolean; user?: { role?: string } | null };
        const authed = Boolean(data?.authenticated);
        const role   = data?.user?.role ?? "";
        const paid   = role === "admin" || role === "artist" || role === "sponsor" ||
                       role === "superadmin" || role === "owner";
        setIsSubscribed(authed && paid);
      })
      .catch(() => { /* stays false — free user path */ });
    return () => { active = false; };
  }, []);

  // Detect wide screen for spread layout
  useEffect(() => {
    function check() { setIsWide(window.innerWidth >= 900); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Compute all spread start indices
  const spreadStarts = useMemo(() => {
    const arr = [0];
    for (let i = 1; i < pages.length; i += 2) arr.push(i);
    return arr;
  }, [pages.length]);

  // Find the index of the spread that contains currentLeft
  const currentSpreadIdx = useMemo(() => {
    let best = 0;
    for (let i = 0; i < spreadStarts.length; i++) {
      if (spreadStarts[i] <= currentLeft) best = i;
      else break;
    }
    return best;
  }, [spreadStarts, currentLeft]);

  const isFirst  = currentSpreadIdx === 0;
  const isLast   = currentSpreadIdx === spreadStarts.length - 1;
  const isLocked = !isSubscribed && currentLeft >= FREE_PAGE_THRESHOLD;

  function goBackToFree() {
    const lastFreeStart = spreadStarts.filter(s => s < FREE_PAGE_THRESHOLD).at(-1) ?? 0;
    goToSpread(lastFreeStart, "backward");
  }

  const leftPage  = pages[currentLeft];
  const rightPage = currentLeft > 0 && currentLeft + 1 < pages.length ? pages[currentLeft + 1] : null;
  const showSpread = isWide && currentLeft > 0 && !!rightPage;

  const goToSpread = useCallback((leftIdx: number, dir: FlipDirection) => {
    if (stateRef.current.flipping) return;
    if (reduced) {
      setCurrentLeft(leftIdx);
      onPageChange?.(pages[leftIdx], leftIdx);
      return;
    }
    audioRef.current?.playPageTurn();
    setFlipping(dir);
    setFlipPhase("out");

    // Out-phase complete: swap content and snap to the other side (no transition)
    window.setTimeout(() => {
      setCurrentLeft(leftIdx);
      setFlipPhase("snap");
      onPageChange?.(pages[leftIdx], leftIdx);

      // One rAF pair ensures the browser paints the snapped (edge-on) state
      // before we start the in-phase transition, avoiding a flash
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFlipPhase("in");

          window.setTimeout(() => {
            setFlipping(null);
            setFlipPhase(null);
          }, HALF_FLIP);
        });
      });
    }, HALF_FLIP);
  }, [reduced, pages, onPageChange]);

  const goNext = useCallback(() => {
    const { currentLeft: cl, flipping: f } = stateRef.current;
    if (f) return;
    let si = 0;
    for (let i = 0; i < spreadStarts.length; i++) {
      if (spreadStarts[i] <= cl) si = i; else break;
    }
    const next = spreadStarts[si + 1];
    if (next !== undefined) goToSpread(next, "forward");
  }, [spreadStarts, goToSpread]);

  const goPrev = useCallback(() => {
    const { currentLeft: cl, flipping: f } = stateRef.current;
    if (f) return;
    let si = 0;
    for (let i = 0; i < spreadStarts.length; i++) {
      if (spreadStarts[i] <= cl) si = i; else break;
    }
    const prev = spreadStarts[si - 1];
    if (prev !== undefined) goToSpread(prev, "backward");
  }, [spreadStarts, goToSpread]);

  // Keyboard handler
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft")  goPrev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  // Swipe handlers
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 50) return;
    if (dx < 0) goNext();
    else goPrev();
  }

  // --- Physics: transform -------------------------------------------------------
  // "out"  phase: current page curls to the edge (±90°), ease-in (accelerates into fold)
  // "snap" phase: no transform transition — content snaps to the far-edge position
  // "in"   phase: new page uncurls from ±90° back to 0°, ease-out (decelerates to rest)
  let flipTransform = "perspective(1400px) rotateY(0deg) scale(1)";
  let flipTransition: string | undefined =
    `transform ${TIMING.pageFlip}ms cubic-bezier(0.4,0,0.2,1), opacity ${TIMING.pageFlip * 0.55}ms ease`;
  let flipOpacity = 1;

  if (!reduced && flipping) {
    if (flipPhase === "out") {
      // Page curls away: forward → rotates left (negative Y), backward → rotates right
      flipTransform = flipping === "forward"
        ? "perspective(1400px) rotateY(-90deg) scale(0.93)"
        : "perspective(1400px) rotateY(90deg) scale(0.93)";
      // Accelerate into the fold
      flipTransition = `transform ${HALF_FLIP}ms cubic-bezier(0.55,0,1,1), opacity ${HALF_FLIP}ms ease-in`;
      flipOpacity = 0.04; // near-invisible at edge-on

    } else if (flipPhase === "snap") {
      // Edge-on position on the far side — no transition, instant paint
      flipTransform = flipping === "forward"
        ? "perspective(1400px) rotateY(90deg) scale(0.93)"
        : "perspective(1400px) rotateY(-90deg) scale(0.93)";
      flipTransition = "none";
      flipOpacity = 0;

    } else if (flipPhase === "in") {
      // New page uncurls back to flat — decelerate to rest with spring-like ease
      flipTransform = "perspective(1400px) rotateY(0deg) scale(1)";
      flipTransition = `transform ${HALF_FLIP}ms cubic-bezier(0,0,0.3,1), opacity ${HALF_FLIP}ms ease-out`;
      flipOpacity = 1;
    }
  }

  // --- Physics: edge glow & page-stack depth via box-shadow ---------------------
  const edgeColor = leftPage ? TYPE_COLOR[leftPage.type] : "#00FFFF";

  // Three faint layers offset behind the spread simulate stacked page thickness
  const pageStack = !reduced
    ? `3px 5px 0 1px rgba(10,10,22,0.85), 6px 9px 0 2px rgba(10,10,22,0.68), 9px 13px 0 3px rgba(10,10,22,0.5)`
    : "";
  const edgeGlow = !reduced
    ? `0 0 18px ${edgeColor}22, 0 0 36px ${edgeColor}0e`
    : "";
  const baseShad = "0 8px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)";
  const spreadBoxShadow = [baseShad, pageStack, edgeGlow].filter(Boolean).join(", ");

  // --- Physics: fold shadow that darkens the leading edge during the curl -------
  // For a forward flip the fold sweeps from right-to-left; backward left-to-right.
  const foldShadowVisible = !reduced && !!flipping && flipPhase !== null;
  const foldShadowOpacity = flipPhase === "out" ? 1 : flipPhase === "in" ? 0.2 : 0;
  const foldShadowBg = flipping === "forward"
    ? "linear-gradient(to left, rgba(0,0,0,0.72) 0%, transparent 55%)"
    : "linear-gradient(to right, rgba(0,0,0,0.72) 0%, transparent 55%)";
  const foldShadowTransition = flipPhase === "snap"
    ? "none"
    : `opacity ${HALF_FLIP}ms ease`;

  return (
    <div
      data-testid="magazine-shell"
      aria-label="TMI Magazine"
      style={{
        minHeight: "100vh",
        paddingTop: 56, // offset fixed global nav
        background: "linear-gradient(160deg, #0a0014 0%, #020617 60%, #0a0a0f 100%)",
        color: "#e2e8f0",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
      }}
    >
      {/* Masthead */}
      <header style={{
        padding: "12px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(0,255,255,0.1)",
        background: "rgba(5,5,16,0.8)",
        backdropFilter: "blur(8px)",
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontSize: 8, letterSpacing: "0.4em", color: "#FF2DAA", fontWeight: 800, textTransform: "uppercase" }}>
            {issueTitle}
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "0.15em" }}>
            Issue #{issue} — April 2026
          </span>
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>
          {showSpread
            ? `Pages ${currentLeft + 1}–${Math.min(currentLeft + 2, pages.length)} of ${pages.length}`
            : `Page ${currentLeft + 1} of ${pages.length}`}
        </div>
      </header>

      {/* Page canvas */}
      <div
        ref={containerRef}
        style={{ position: "relative", overflow: "hidden", padding: "24px" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Edge lighting pulse on the container when spread is idle */}
        {!reduced && !flipping && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 24,
              borderRadius: 12,
              pointerEvents: "none",
              boxShadow: `inset 0 0 0 1px ${edgeColor}14`,
              transition: `box-shadow ${TIMING.slow}ms ease`,
            }}
          />
        )}

        <div
          data-testid={`magazine-page-${leftPage?.id}`}
          style={{
            width: "100%",
            minHeight: 520,
            maxWidth: showSpread ? 1100 : 680,
            margin: "0 auto",
            position: "relative",
            transition: reduced ? undefined : flipTransition,
            transform: flipTransform,
            opacity: flipOpacity,
            willChange: "transform, opacity",
            borderRadius: 10,
            border: `1px solid rgba(255,255,255,0.06)`,
            background: "rgba(5,5,16,0.7)",
            display: showSpread ? "flex" : "block",
            overflow: "hidden",
            boxShadow: spreadBoxShadow,
          }}
        >
          {showSpread ? (
            <>
              <PagePane page={leftPage}  side="left"  />
              <PagePane page={rightPage!} side="right" />
            </>
          ) : (
            <PagePane page={leftPage} side="solo" />
          )}

          {isLocked && <LockedSpreadModal onBack={goBackToFree} />}

          {/* Fold shadow — sweeps across the leading edge as the page curls */}
          {foldShadowVisible && (
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 10,
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
          background: "rgba(5,5,16,0.8)",
          backdropFilter: "blur(8px)",
        }}
      >
        <button
          data-testid="magazine-prev"
          type="button"
          aria-label="Previous spread"
          disabled={isFirst || !!flipping}
          onClick={goPrev}
          style={{
            border: "1px solid rgba(0,255,255,0.2)", borderRadius: 8,
            background: "transparent", color: isFirst ? "#1e293b" : "#00FFFF",
            padding: "8px 20px", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em",
            cursor: isFirst ? "not-allowed" : "pointer",
            transition: `background ${TIMING.fast}ms ease`,
          }}
        >
          ← PREV
        </button>

        {/* Spread dots */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {spreadStarts.map((start, i) => {
            const active = i === currentSpreadIdx;
            return (
              <button
                key={start}
                data-testid={`magazine-dot-${i}`}
                type="button"
                onClick={() => goToSpread(start, start > currentLeft ? "forward" : "backward")}
                style={{
                  width: active ? 20 : 7,
                  height: 7,
                  borderRadius: 4,
                  background: active ? "#FF2DAA" : "rgba(255,255,255,0.2)",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  transition: `all ${TIMING.fast}ms ease`,
                }}
                aria-label={`Go to spread ${i + 1}`}
              />
            );
          })}
        </div>

        <button
          data-testid="magazine-next"
          type="button"
          aria-label="Next spread"
          disabled={isLast || !!flipping}
          onClick={goNext}
          style={{
            border: "1px solid rgba(0,255,255,0.2)", borderRadius: 8,
            background: "transparent", color: isLast ? "#1e293b" : "#00FFFF",
            padding: "8px 20px", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em",
            cursor: isLast ? "not-allowed" : "pointer",
            transition: `background ${TIMING.fast}ms ease`,
          }}
        >
          NEXT →
        </button>
      </nav>
    </div>
  );
}
