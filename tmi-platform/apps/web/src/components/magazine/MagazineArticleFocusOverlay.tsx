"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { type MagazineArticle } from "@/lib/magazine/magazineIssueData";
import { TMI_CANVAS_TOKENS } from "@/lib/magazine/TmiSurfaceParityEngine";
import { TmiMagazineAudioEngine } from "@/lib/magazine/tmiMagazineAudioEngine";
import { deriveSubjectComposition } from "@/lib/magazine/SubjectCompositionEngine";

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
  const [fanComment, setFanComment] = useState("");
  const [commentsList, setCommentsList] = useState<Array<{ id: string; user: string; text: string; time: string }>>([
    { id: "c1", user: "Marcus_V", text: "That line about the voltage through your boots is so true. Nothing beats a live room.", time: "2h ago" },
    { id: "c2", user: "SarahSound", text: "Obsidian Water is on repeat every morning. Best production of 2026.", time: "4h ago" },
    { id: "c3", user: "BeatMaker99", text: "Huge respect to Ricardo for putting independent artists first.", time: "6h ago" },
  ]);

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

  function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!fanComment.trim()) return;
    setCommentsList([
      {
        id: `c-${Date.now()}`,
        user: "You",
        text: fanComment.trim(),
        time: "Just now",
      },
      ...commentsList,
    ]);
    setFanComment("");
  }

  if (!isOpen) return null;

  const heroColor = article.heroColor || TMI_CANVAS_TOKENS.orangePrimaryAccent;
  const isPerformerStory = Boolean(article.performerSlug);
  const composition = deriveSubjectComposition(article);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={article.title}
      data-testid="magazine-article-focus-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1500,
        display: "flex",
        flexDirection: "column",
        background: "rgba(6, 4, 14, 0.94)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        animation: "fadeIn 0.25s ease-out",
        color: "#fff",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .article-serif-headline {
          font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
          letter-spacing: -0.01em;
          line-height: 1.12;
        }
        .article-drop-cap::first-letter {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 3.8em;
          float: left;
          line-height: 0.8;
          margin-right: 12px;
          margin-top: 4px;
          color: ${heroColor};
          font-weight: 900;
          text-shadow: 0 0 20px ${heroColor}66;
        }
        .article-focus-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .article-focus-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 215, 0, 0.3);
          border-radius: 3px;
        }
        @media (max-width: 767px) {
          .article-hero-grid {
            grid-template-columns: 1fr !important;
          }
          .article-hero-portrait {
            height: 260px !important;
          }
        }
        @media (max-width: 991px) {
          .article-body-grid-three-col {
            grid-template-columns: 1fr !important;
          }
          .article-member-left-rail {
            display: none !important;
          }
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
          {/* 1. ARTICLE HERO: DYNAMIC GROUP VS SOLO COMPOSITION (Subject Composition Law) */}
          {composition.isGroup ? (
            <div
              data-testid="group-hero-composition"
              style={{
                marginBottom: 40,
                background: "linear-gradient(135deg, rgba(22, 4, 28, 0.8), rgba(6, 26, 30, 0.7))",
                border: "1.5px solid rgba(255, 215, 0, 0.3)",
                borderRadius: 16,
                padding: "28px 24px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Confetti motif band */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: "linear-gradient(90deg, #00FFFF, #FF2DAA, #FFD700, #AA2DFF)",
                }}
              />

              {/* Wide Ensemble Hero Image (16:9 landscape so full lineup fits) */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16 / 9",
                  maxHeight: 400,
                  borderRadius: 12,
                  overflow: "hidden",
                  border: `2px solid ${heroColor}`,
                  boxShadow: `0 0 35px ${heroColor}44`,
                  background: "#050510",
                  marginBottom: 24,
                }}
              >
                <img
                  src={composition.heroSlot.url}
                  alt={article.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(5,5,16,0.9) 0%, transparent 50%)",
                  }}
                />
                <div style={{ position: "absolute", bottom: 16, left: 20, right: 20, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        borderRadius: 4,
                        background: "#FFD700",
                        color: "#050510",
                        fontSize: 9,
                        fontWeight: 900,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                      }}
                    >
                      {composition.subjectType.replace("_", " ")} COVER STORY
                    </span>
                    {article.performerSlug && (
                      <div style={{ marginTop: 6, fontSize: 16, fontWeight: 900, color: "#fff" }}>
                        {article.performerSlug.replace("-", " ").toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", background: "rgba(0,0,0,0.6)", padding: "3px 8px", borderRadius: 4 }}>
                    {composition.heroSlot.credit}
                  </span>
                </div>
              </div>

              {/* Editorial Typography */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 900,
                      letterSpacing: "0.2em",
                      color: heroColor,
                      textTransform: "uppercase",
                    }}
                  >
                    ★ GROUP FEATURE
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>·</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", letterSpacing: "0.08em" }}>
                    6 MIN READ
                  </span>
                </div>

                <h1
                  className="article-serif-headline"
                  style={{
                    fontSize: "clamp(26px, 4vw, 44px)",
                    margin: 0,
                    color: "#FFF8E7",
                    textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                  }}
                >
                  {article.title}
                </h1>

                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: "rgba(255, 248, 231, 0.8)",
                    margin: 0,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {article.subtitle}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    paddingTop: 12,
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  <span>
                    BY{" "}
                    <Link href={composition.writerPageRoute} style={{ color: "#FFD700", textDecoration: "none", fontWeight: 800 }}>
                      {article.author}
                    </Link>
                  </span>
                  <span>{article.publishedAt}</span>
                </div>
              </div>

              {/* Meet the Lineup (Horizontal Strip) */}
              {composition.memberSlots.length > 0 && (
                <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: "#00FFFF", marginBottom: 12 }}>
                    MEET THE LINEUP ({composition.memberSlots.length} MEMBERS)
                  </div>
                  <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6 }}>
                    {composition.memberSlots.map((m) => (
                      <div
                        key={m.id}
                        style={{
                          minWidth: 140,
                          padding: "10px 14px",
                          borderRadius: 8,
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: "50%",
                            overflow: "hidden",
                            border: `1.5px solid ${heroColor}88`,
                            marginBottom: 6,
                            background: "#000",
                          }}
                        >
                          <img src={m.avatarUrl} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 900, color: "#fff" }}>{m.name}</div>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{m.role}</div>
                        {m.publicProfileSlug && (
                          <Link
                            href={`/p/${m.publicProfileSlug}`}
                            style={{
                              fontSize: 8,
                              fontWeight: 800,
                              color: "#00FFFF",
                              marginTop: 6,
                              textDecoration: "none",
                              borderBottom: "1px dotted #00FFFF",
                            }}
                          >
                            VIEW PROFILE →
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div
              className="article-hero-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1.1fr 1.3fr",
                gap: 32,
                alignItems: "center",
                marginBottom: 40,
                background: "linear-gradient(135deg, rgba(22, 4, 28, 0.8), rgba(6, 26, 30, 0.7))",
                border: "1.5px solid rgba(255, 215, 0, 0.3)",
                borderRadius: 16,
                padding: "28px 24px",
                boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Confetti motif band */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: "linear-gradient(90deg, #00FFFF, #FF2DAA, #FFD700, #AA2DFF)",
                }}
              />

              {/* Left: Oversized artist portrait with neon frame */}
              <div
                className="article-hero-portrait"
                style={{
                  position: "relative",
                  height: 380,
                  borderRadius: 12,
                  overflow: "hidden",
                  border: `2px solid ${heroColor}`,
                  boxShadow: `0 0 30px ${heroColor}44`,
                  background: "#050510",
                }}
              >
                <img
                  src={
                    article.slug.includes("ricardo")
                      ? "/tmi-curated/mag-20.jpg"
                      : article.slug.includes("wavetek")
                        ? "/tmi-curated/mag-28.jpg"
                        : article.slug.includes("neon")
                          ? "/tmi-curated/mag-35.jpg"
                          : "/tmi-curated/mag-50.jpg"
                  }
                  alt={article.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(5,5,16,0.85) 0%, transparent 60%)",
                  }}
                />
                <div style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: 4,
                      background: "#FFD700",
                      color: "#050510",
                      fontSize: 9,
                      fontWeight: 900,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                    }}
                  >
                    PRO ARTIST FEATURE
                  </span>
                  {article.performerSlug && (
                    <div style={{ marginTop: 6, fontSize: 13, fontWeight: 900, color: "#fff" }}>
                      {article.performerSlug.replace("-", " ").toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Editorial Typography */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 900,
                      letterSpacing: "0.2em",
                      color: heroColor,
                      textTransform: "uppercase",
                    }}
                  >
                    ★ COVER STORY
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>·</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", letterSpacing: "0.08em" }}>
                    5 MIN READ
                  </span>
                </div>

                <h1
                  className="article-serif-headline"
                  style={{
                    fontSize: "clamp(26px, 4vw, 44px)",
                    margin: 0,
                    color: "#FFF8E7",
                    textShadow: "0 2px 10px rgba(0,0,0,0.5)",
                  }}
                >
                  {article.title}
                </h1>

                <p
                  style={{
                    fontSize: 15,
                    lineHeight: 1.6,
                    color: "rgba(255, 248, 231, 0.8)",
                    margin: 0,
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {article.subtitle}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    paddingTop: 12,
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  <span>
                    BY{" "}
                    <Link href={composition.writerPageRoute} style={{ color: "#FFD700", textDecoration: "none", fontWeight: 800 }}>
                      {article.author}
                    </Link>
                  </span>
                  <span>{article.publishedAt}</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. ARTICLE BODY: NARRATIVE + Q&A + PULL QUOTES */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr clamp(260px, 30%, 320px)",
              gap: 32,
              alignItems: "start",
            }}
          >
            {/* Left: Main Editorial Stream */}
            <article style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {/* Drop-cap introductory narrative */}
              <div
                className="article-drop-cap"
                style={{
                  fontSize: 16,
                  lineHeight: 1.8,
                  color: "#FFF8E7",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {article.blocks[0]?.text ||
                  "The sound doesn't lie. When the crowd hits two thousand voices inside the arena, you feel the raw voltage pulse directly through your boots into the stage planks."}
              </div>

              {/* Styled Pull Quote */}
              <div
                style={{
                  padding: "24px 28px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, rgba(42, 6, 54, 0.85), rgba(6, 26, 30, 0.85))",
                  borderLeft: "4px solid #FFD700",
                  borderTop: "1px solid rgba(255,215,0,0.2)",
                  borderRight: "1px solid rgba(255,215,0,0.1)",
                  borderBottom: "1px solid rgba(255,215,0,0.1)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                  margin: "12px 0",
                }}
              >
                <div style={{ fontSize: 24, color: "#FFD700", lineHeight: 1, marginBottom: 8 }}>“</div>
                <div
                  className="article-serif-headline"
                  style={{
                    fontSize: 20,
                    color: "#FFF8E7",
                    fontStyle: "italic",
                    lineHeight: 1.4,
                  }}
                >
                  {article.blocks.find(b => b.type === "pullquote")?.text?.replace(/"/g, "") ||
                    "We didn't wait for permission from the legacy gatekeepers. TMI handed us the mic and the fans built the stage."}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,215,0,0.7)", fontWeight: 800, marginTop: 12, letterSpacing: "0.12em" }}>
                  — {article.performerSlug ? article.performerSlug.replace("-", " ").toUpperCase() : article.author}
                </div>
              </div>

              {/* Embedded Video Player Feature */}
              <div
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid rgba(0, 255, 255, 0.3)",
                  background: "#050510",
                  boxShadow: "0 12px 36px rgba(0,0,0,0.6)",
                }}
              >
                <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9", overflow: "hidden" }}>
                  <img
                    src="/tmi-curated/mag-42.jpg"
                    alt="Video Interview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(5,5,16,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #00FFFF, #AA2DFF)",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 24,
                        color: "#050510",
                        fontWeight: 900,
                        boxShadow: "0 0 30px rgba(0,255,255,0.6)",
                        cursor: "pointer",
                      }}
                    >
                      ▶
                    </div>
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      bottom: 12,
                      left: 14,
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.12em",
                      background: "rgba(0,0,0,0.75)",
                      padding: "4px 8px",
                      borderRadius: 4,
                      color: "#00FFFF",
                    }}
                  >
                    EXCLUSIVE STUDIO CYPHER REPLAY · 4:18
                  </div>
                </div>
              </div>

              {/* Q&A Interview Section */}
              <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 8 }}>
                <div style={{ padding: "16px 20px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#FFD700", letterSpacing: "0.1em", marginBottom: 6 }}>
                    TMI: WHEN YOU STEPPED ONTO MONDAY STAGE, DID YOU ANTICIPATE THE CROWD ENERGY?
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255, 248, 231, 0.9)", margin: 0 }}>
                    &ldquo;Honestly, no. You spend weeks perfecting the 808s and the transitions in isolation. But when that first bass drop hits the arena monitors and two thousand avatars start emoting in rhythm, it transforms from a track into a collective experience.&rdquo;
                  </p>
                </div>

                <div style={{ padding: "16px 20px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.1em", marginBottom: 6 }}>
                    TMI: HOW HAS DIRECT FAN ENGAGEMENT CHANGED YOUR CREATIVE FREEDOM?
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255, 248, 231, 0.9)", margin: 0 }}>
                    &ldquo;When fans can tip directly, join the Fan Club, and vote on what gets made next, you don&apos;t need to pander to radio program directors. You just make the truest, heaviest music possible.&rdquo;
                  </p>
                </div>
              </div>

              {/* Audio Track Preview Player */}
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, rgba(0,255,255,0.08), rgba(5,5,16,0.9))",
                  border: "1px solid rgba(0,255,255,0.3)",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginTop: 8,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    background: "#00FFFF",
                    color: "#050510",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 16,
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  ▶
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Featured Audio Track: &quot;Obsidian Water&quot;</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>High-Fidelity Master · 3:24 · Spatial Audio Active</div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 900, color: "#00FFFF", border: "1px solid #00FFFF", borderRadius: 4, padding: "3px 8px" }}>
                  TMI ORIGINAL
                </span>
              </div>

              {/* Multi-Image Stage & Production Gallery (TMI — Group Image Composition Law) */}
              {composition.supportingMediaSlots.filter((s) => s.status === "READY" && s.url).length > 0 && (
                <div style={{ margin: "20px 0", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: "#00FFFF" }}>
                    STAGE & PRODUCTION GALLERY
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                    {composition.supportingMediaSlots
                      .filter((s) => s.status === "READY" && s.url)
                      .map((s) => (
                        <div
                          key={s.slotId}
                          style={{
                            borderRadius: 10,
                            overflow: "hidden",
                            border: "1px solid rgba(255,255,255,0.1)",
                            background: "#050510",
                          }}
                        >
                          <div style={{ width: "100%", aspectRatio: "16 / 9", overflow: "hidden" }}>
                            <img
                              src={s.url}
                              alt={s.caption || s.title}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </div>
                          {s.caption && (
                            <div style={{ padding: "8px 12px", fontSize: 10, color: "rgba(255,255,255,0.6)", background: "rgba(0,0,0,0.5)" }}>
                              {s.caption}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Reserved Video Feature Slot (TMI — Article Reserved Placement Law) */}
              {composition.supportingMediaSlots.some((s) => s.status === "RESERVED" && s.comingSoonLabel) && (
                <div
                  data-testid="reserved-editorial-slot"
                  style={{
                    margin: "16px 0",
                    padding: "16px 20px",
                    borderRadius: 12,
                    background: "linear-gradient(135deg, rgba(255,45,170,0.08), rgba(0,255,255,0.05))",
                    border: "1px dashed rgba(255,45,170,0.4)",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <span style={{ fontSize: 22 }}>🎬</span>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: "#FF2DAA" }}>
                      RESERVED EDITORIAL SLOT
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", marginTop: 2 }}>
                      {composition.supportingMediaSlots.find((s) => s.status === "RESERVED")?.comingSoonLabel}
                    </div>
                  </div>
                </div>
              )}

              {/* Community Comments */}
              <div style={{ marginTop: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.16em", color: "#FFD700", marginBottom: 14 }}>
                  FAN CONVERSATION ({commentsList.length})
                </div>

                <form onSubmit={handleAddComment} style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                  <input
                    type="text"
                    value={fanComment}
                    onChange={(e) => setFanComment(e.target.value)}
                    placeholder="Leave your thoughts on this story..."
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#fff",
                      fontSize: 12,
                      outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: "10px 20px",
                      borderRadius: 8,
                      background: "#FFD700",
                      color: "#050510",
                      fontSize: 11,
                      fontWeight: 900,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    POST
                  </button>
                </form>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {commentsList.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        padding: "12px 16px",
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 800, color: "#00FFFF" }}>{c.user}</span>
                        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{c.time}</span>
                      </div>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", margin: 0, lineHeight: 1.5 }}>{c.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            {/* Right: Commerce, Artist Support & Related Features */}
            <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Support the artist commerce block */}
              {isPerformerStory && (
                <div
                  style={{
                    padding: "20px 22px",
                    borderRadius: 14,
                    background: "linear-gradient(135deg, rgba(255,45,170,0.12), rgba(10,5,20,0.9))",
                    border: "1.5px solid rgba(255,45,170,0.4)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
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

              {/* Crown Progression & Badges */}
              <div
                style={{
                  padding: "18px 20px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: "#FFD700", marginBottom: 10 }}>
                  CROWN PROGRESSION
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 28 }}>👑</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>Top 10 Contender</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>Rank #4 · 12,840 Fan Votes</div>
                  </div>
                </div>
              </div>

              {/* Related stories */}
              <div
                style={{
                  padding: "18px 20px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: "#00FFFF", marginBottom: 12 }}>
                  RELATED STORIES
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { slug: "wavetek-rise-billboard", title: "Wavetek's Rise: From the Block to Billboard" },
                    { slug: "neon-vibe-monday-stage", title: "Neon Vibe Takes Over Monday Stage" },
                    { slug: "beat-marketplace-economy", title: "The Beat Marketplace: Inside TMI's Economy" },
                  ]
                    .filter((s) => s.slug !== article.slug)
                    .map((item) => (
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
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
