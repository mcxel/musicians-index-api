"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MAGAZINE_ISSUE_1, type MagazineArticle } from "@/lib/magazine/magazineIssueData";
import { TMI_CANVAS_TOKENS } from "@/lib/magazine/TmiSurfaceParityEngine";
import { deriveSubjectComposition } from "@/lib/magazine/SubjectCompositionEngine";
import { ARCHETYPES } from "@/lib/magazine/MagazineDesignEngine";
import {
  resolveSheetPalette,
  sheetCssVariables,
  type MagazineStoryKind,
} from "@/lib/magazine/MagazineFullCrayonBoxColorPolicy";
import MagazineMemphisMotifLayer, {
  resolveMemphisVariant,
} from "@/components/magazine/MagazineMemphisMotifLayer";
// §20984 — ONE canonical article content/composition authority. The overlay is a
// presentation shell (modal chrome, back/listen/close, keyboard, scroll-lock) around
// it, never an independent renderer of article.blocks. See MagazineContinuousFeatureSheet.
import MagazineContinuousFeatureSheet from "@/components/magazine/MagazineContinuousFeatureSheet";

function storyKindFromArticle(article: MagazineArticle): MagazineStoryKind {
  if (article.performerSlug) {
    if (article.category === "interview") return "INTERVIEW";
    if (article.category === "review") return "MUSIC_RELEASE";
    return "PERFORMER_FEATURE";
  }
  switch (article.category) {
    case "news":
      return "NEWS";
    case "interview":
      return "INTERVIEW";
    case "review":
      return "MUSIC_RELEASE";
    case "editorial":
      return "EDITORIAL";
    case "feature":
    default:
      return "PERFORMER_FEATURE";
  }
}

interface MagazineArticleFocusOverlayProps {
  article: MagazineArticle;
  isOpen: boolean;
  onClose: () => void;
  onSelectRelatedArticle?: (slug: string) => void;
  originatingPageNumber?: number;
}

export default function MagazineArticleFocusOverlay({
  article,
  isOpen,
  onClose,
  onSelectRelatedArticle,
  originatingPageNumber = 1,
}: MagazineArticleFocusOverlayProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [hasEarnedXp, setHasEarnedXp] = useState(false);

  // Real related articles — same category first, excluding self, capped at 3.
  // Replaces a previously hardcoded fixed 3-slug list that never matched the open article.
  const relatedArticles = useMemo(() => {
    const sameCategory = MAGAZINE_ISSUE_1.filter(
      (a) => a.slug !== article.slug && a.category === article.category,
    );
    const rest = MAGAZINE_ISSUE_1.filter(
      (a) => a.slug !== article.slug && a.category !== article.category,
    );
    return [...sameCategory, ...rest].slice(0, 3);
  }, [article.slug, article.category]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll while overlay is open
  useEffect(() => {
    if (isOpen) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = origOverflow;
      };
    }
  }, [isOpen]);

  // Track internal reading progress
  function handleScroll() {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const progress = Math.min(100, Math.max(0, (scrollTop / (scrollHeight - clientHeight)) * 100));
    setScrollProgress(progress);

    if (progress > 60 && !hasEarnedXp) {
      setHasEarnedXp(true);
    }
  }

  // Handle audio narration / preview
  function handleToggleAudio() {
    setIsPlayingAudio(!isPlayingAudio);
    if (!isPlayingAudio && "speechSynthesis" in window) {
      const textToRead = `${article.title}. ${article.subtitle}. ${article.blocks.map(b => b.text || "").join(" ")}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else if (isPlayingAudio && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  if (!isOpen) return null;

  const isPerformerStory = Boolean(article.performerSlug);
  const composition = deriveSubjectComposition(article);
  const storyKind = storyKindFromArticle(article);
  const sheetPalette = resolveSheetPalette({ storyKind });
  const sheetArchetype = ARCHETYPES[sheetPalette.archetype];
  const sheetVars = sheetCssVariables(sheetPalette);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={article.title}
      data-testid="magazine-article-focus-overlay"
      data-magazine-sheet-family={sheetPalette.family}
      data-magazine-sheet-archetype={sheetArchetype.id}
      style={{
        ...sheetVars,
        position: "fixed",
        inset: 0,
        zIndex: 1500,
        display: "flex",
        flexDirection: "column",
        // §20930 — article SHEET = 80s print paper; not black UI chrome
        background: sheetArchetype.leftPageBg,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        animation: "fadeIn 0.25s ease-out",
        color: sheetArchetype.inkColor,
      }}
    >
      {!sheetArchetype.darkJustified && (
        <MagazineMemphisMotifLayer
          variant={resolveMemphisVariant(sheetArchetype.id)}
          opacity={0.38}
        />
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .article-focus-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .article-focus-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.3);
          border-radius: 3px;
        }
      `}</style>

      {/* Top floating control bar */}
      <header
        style={{
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          background: "rgba(10, 5, 20, 0.85)",
          flexShrink: 0,
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Left: Back button with origin page memory */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            type="button"
            onClick={onClose}
            data-testid="article-focus-close-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255, 215, 0, 0.12)",
              border: "1px solid #FFD700",
              color: "#FFD700",
              borderRadius: 8,
              padding: "7px 16px",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.08em",
              cursor: "pointer",
            }}
          >
            <span>←</span>
            <span>BACK TO PAGE {originatingPageNumber}</span>
          </button>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            TMI MAGAZINE · {article.category.toUpperCase()}
          </span>
        </div>

        {/* Right: Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            onClick={handleToggleAudio}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: isPlayingAudio ? "rgba(255, 45, 170, 0.2)" : "rgba(255, 255, 255, 0.06)",
              border: `1px solid ${isPlayingAudio ? "#FF2DAA" : "rgba(255, 255, 255, 0.2)"}`,
              color: isPlayingAudio ? "#FF2DAA" : "#fff",
              borderRadius: 8,
              padding: "6px 14px",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.06em",
              cursor: "pointer",
            }}
          >
            <span>{isPlayingAudio ? "⏸ PAUSE" : "🎙️ LISTEN"}</span>
          </button>

          {hasEarnedXp && (
            <span style={{ fontSize: 10, fontWeight: 900, color: "#00FF88", background: "rgba(0,255,136,0.12)", padding: "4px 10px", borderRadius: 20, border: "1px solid #00FF88" }}>
              ⭐ +50 XP
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close article"
            style={{
              background: "none",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              color: "rgba(255, 255, 255, 0.8)",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            ✕
          </button>
        </div>

        {/* Reading progress line across the bottom of the header */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: 3,
            width: `${scrollProgress}%`,
            background: "linear-gradient(90deg, #FFD700, #FF2DAA, #00FFFF)",
            transition: "width 0.1s ease-out",
          }}
        />
      </header>

      {/* Main scrolling article body */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="article-focus-scroll"
        style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          paddingBottom: 80,
        }}
      >
        <div
          style={{
            maxWidth: TMI_CANVAS_TOKENS.maxWidth,
            margin: "0 auto",
            padding: "36px 20px",
          }}
        >
          {/* §20984 — canonical article content/composition authority. Same component,
              same adaptive movements, same sources/media/translation/Conversation as the
              issue-page presentation. This overlay is navigation/commerce chrome around it,
              never a second renderer of article.blocks. */}
          <MagazineContinuousFeatureSheet
            article={article}
            variant="OVERLAY"
            pageNumber={originatingPageNumber}
          />

          {/* Commerce + discovery footer — full-width so it reflows cleanly on mobile
              instead of being squeezed into a narrow sidebar column (prior mobile clipping). */}
          <div
            style={{
              marginTop: 24,
              display: "grid",
              gridTemplateColumns: isPerformerStory ? "1fr 1fr" : "1fr",
              gap: 20,
            }}
            className="article-focus-footer-grid"
          >
            <style>{`
              @media (max-width: 767px) {
                .article-focus-footer-grid { grid-template-columns: 1fr !important; }
              }
            `}</style>

            {/* Support the artist commerce block — real performerSlug-bound CTAs only */}
            {isPerformerStory && (
              <div
                style={{
                  padding: "20px 22px",
                  borderRadius: 14,
                  background: "linear-gradient(135deg, rgba(255,45,170,0.12), rgba(10,5,20,0.9))",
                  border: "1.5px solid rgba(255,45,170,0.4)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                  minWidth: 0,
                }}
              >
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.2em", color: "#FF2DAA", marginBottom: 8, textTransform: "uppercase" }}>
                  SUPPORT THE ARTIST
                </div>
                <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 900, color: "#fff" }}>
                  {article.performerSlug?.replace("-", " ").toUpperCase()}
                </h3>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, marginBottom: 16 }}>
                  Direct-to-artist revenue. 100% of tips and subscriptions flow straight to their verified ledger.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Link
                    href={`/tips?to=${encodeURIComponent(article.performerSlug || "")}`}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 8,
                      background: "#FFD700",
                      color: "#050510",
                      fontSize: 11,
                      fontWeight: 900,
                      textDecoration: "none",
                      textAlign: "center",
                      letterSpacing: "0.08em",
                    }}
                  >
                    💰 SEND ARTIST TIP
                  </Link>

                  <Link
                    href={composition.ctaRoute}
                    style={{
                      padding: "9px 16px",
                      borderRadius: 8,
                      background: "rgba(255,45,170,0.18)",
                      border: "1px solid #FF2DAA",
                      color: "#FF2DAA",
                      fontSize: 10,
                      fontWeight: 900,
                      textDecoration: "none",
                      textAlign: "center",
                    }}
                  >
                    {composition.ctaLabel}
                  </Link>

                  <Link
                    href={`/fan-club/${encodeURIComponent(article.performerSlug || "")}`}
                    style={{
                      padding: "9px 16px",
                      borderRadius: 8,
                      background: "rgba(0,255,255,0.1)",
                      border: "1px solid #00FFFF",
                      color: "#00FFFF",
                      fontSize: 10,
                      fontWeight: 900,
                      textDecoration: "none",
                      textAlign: "center",
                    }}
                  >
                    👑 JOIN FAN CLUB
                  </Link>
                </div>
              </div>
            )}

            {/* Related stories — real articles from the canonical issue data,
                same category first, never a fixed hardcoded list. */}
            <div
              style={{
                padding: "18px 20px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
                minWidth: 0,
              }}
            >
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: "#00FFFF", marginBottom: 12 }}>
                RELATED STORIES
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {relatedArticles.map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => onSelectRelatedArticle?.(item.slug)}
                    style={{
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      padding: "8px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      cursor: "pointer",
                      color: "rgba(255,248,231,0.9)",
                      fontSize: 11,
                      fontWeight: 700,
                      lineHeight: 1.4,
                    }}
                  >
                    {item.title} →
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
