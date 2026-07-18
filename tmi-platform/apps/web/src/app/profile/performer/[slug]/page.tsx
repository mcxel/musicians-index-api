"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useTmiSession } from "@/hooks/SessionContext";
import { PERFORMER_REGISTRY } from "@/lib/performers/PerformerRegistry";
import ProfileShell from "@/components/profile/ProfileShell";
import { notFound } from "next/navigation";
import { BookingCanister } from "@/components/canisters/BookingCanister";
import dynamic from "next/dynamic";

const VenuePreviewCanvas = dynamic(() => import("@/components/3d/VenuePreviewCanvas"), { ssr: false });
const AvatarLobbyCanvas = dynamic(() => import("@/components/3d/AvatarLobbyCanvas"), { ssr: false });

interface PublicYophoPageProps {
  params: Promise<{ slug: string }>;
}

export interface YoPhoThemeConfig {
  background: "cyber" | "gold" | "space" | "retro";
  underlay: "none" | "grid" | "stars" | "circuit";
  overlay: "none" | "smoke" | "lightning" | "fire";
  quoteStyle: "simple" | "neon" | "gold_foil" | "holo";
  emote: string;
  motto: string;
  customBgUrl?: string;
  avatarMode: boolean;
  lobbySkin: string;
  roomSkin: string;
  venueSkin: string;
  avatarEnv: string;
}

const DEFAULT_THEME_CONFIG: YoPhoThemeConfig = {
  background: "cyber",
  underlay: "none",
  overlay: "none",
  quoteStyle: "simple",
  emote: "🔥",
  motto: "Create, perform, headline. This is my stage.",
  avatarMode: false,
  lobbySkin: "cypher-entrance",
  roomSkin: "studio-suite",
  venueSkin: "theater",
  avatarEnv: "neon",
};

const DEFAULT_TRACKS = [
  { title: "TMI Anthem (Cyber Edit)", durationSec: 165 },
  { title: "Universal Venue (Lounge Vibe)", durationSec: 192 },
  { title: "Marcel's Beat Lab Session", durationSec: 118 }
];

function SeatingMapGrid({ accentColor }: { accentColor: string }) {
  const [claimedSeat, setClaimedSeat] = useState<string | null>(null);
  const [occupiedSeats, setOccupiedSeats] = useState<Set<string>>(() => new Set(["A1", "A3", "B2", "C4"]));

  const handleSeatClick = (seatId: string) => {
    if (occupiedSeats.has(seatId) && seatId !== claimedSeat) return;
    
    setOccupiedSeats((prev) => {
      const next = new Set(prev);
      if (claimedSeat === seatId) {
        next.delete(seatId);
        setClaimedSeat(null);
      } else {
        if (claimedSeat) next.delete(claimedSeat);
        next.add(seatId);
        setClaimedSeat(seatId);
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("tmi-xp-reward", {
              detail: { amount: 25, action: `Claimed Seat ${seatId}` },
            })
          );
        }
      }
      return next;
    });
  };

  const rows = ["A", "B", "C", "D"];
  const cols = [1, 2, 3, 4, 5, 6];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols.length}, 1fr)`, gap: 6 }}>
        {rows.map((row) =>
          cols.map((col) => {
            const seatId = `${row}${col}`;
            const isOccupied = occupiedSeats.has(seatId);
            const isMine = claimedSeat === seatId;
            
            let bg = "rgba(255,255,255,0.06)";
            let border = "1px solid rgba(255,255,255,0.12)";
            if (isMine) {
              bg = accentColor;
              border = `1px solid ${accentColor}`;
            } else if (isOccupied) {
              bg = "rgba(255,255,255,0.2)";
              border = "1px solid rgba(255,255,255,0.3)";
            }

            return (
              <button
                key={seatId}
                type="button"
                onClick={() => handleSeatClick(seatId)}
                title={isMine ? "Your Seat" : isOccupied ? "Occupied" : `Seat ${seatId}`}
                style={{
                  width: 24,
                  height: 20,
                  borderRadius: 4,
                  background: bg,
                  border: border,
                  cursor: isOccupied && !isMine ? "not-allowed" : "pointer",
                  fontSize: 8,
                  fontWeight: 900,
                  color: isMine ? "#050510" : "rgba(255,255,255,0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                {col}
              </button>
            );
          })
        )}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }} /> Available
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)" }} /> Taken
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: accentColor, border: `1px solid ${accentColor}` }} /> Yours
        </div>
      </div>
    </div>
  );
}

export default function PublicYophoPage({ params }: PublicYophoPageProps) {
  const [slug, setSlug] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    params.then((p) => {
      setSlug(p.slug);
      setResolved(true);
    });
  }, [params]);

  const { userId } = useTmiSession();
  const performer = slug
    ? PERFORMER_REGISTRY.find((p) => p.slug === slug)
    : undefined;

  if (!resolved || !slug) return null;
  if (!performer) return notFound();

  const isOwner =
    performer.ownerId != null &&
    userId != null &&
    performer.ownerId === userId;

  return (
    <PublicYophoContent performer={performer} isOwner={isOwner} />
  );
}

function PublicYophoContent({ performer, isOwner }: { performer: any; isOwner: boolean }) {
  const [showBooking, setShowBooking] = useState(false);
  const [themeConfig, setThemeConfig] = useState<YoPhoThemeConfig>(DEFAULT_THEME_CONFIG);
  const [performerTier, setPerformerTier] = useState<string>("FREE");
  const [studioOpen, setStudioOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [customBgInput, setCustomBgInput] = useState("");

  // Music Player States
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackProgress, setTrackProgress] = useState(0);
  const [playlistAdded, setPlaylistAdded] = useState(false);

  const playlist = performer.songs && performer.songs.length > 0 ? performer.songs : DEFAULT_TRACKS;
  const currentTrack = playlist[currentTrackIndex];

  // Simulated progress timer when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setTrackProgress((prev) => {
          if (prev >= 100) {
            // Auto skip to next
            setCurrentTrackIndex((idx) => (idx + 1) % playlist.length);
            return 0;
          }
          return prev + 1.5;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, playlist.length]);

  // Load custom database-backed settings on mount
  useEffect(() => {
    const loadCustomProfile = async () => {
      if (!performer.ownerId) return;
      try {
        const res = await fetch(`/api/profile/get?ownerId=${performer.ownerId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.tier) setPerformerTier(data.tier);
          if (data.profile?.socialLinks) {
            const links = data.profile.socialLinks;
            if (links.theme_config) {
              setThemeConfig({
                ...DEFAULT_THEME_CONFIG,
                ...links.theme_config,
              });
              if (links.theme_config.customBgUrl) {
                setCustomBgInput(links.theme_config.customBgUrl);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load public custom theme details:", err);
      }
    };
    void loadCustomProfile();
  }, [performer.ownerId]);

  // Save changes to database
  const saveThemeConfig = async (newConfig: YoPhoThemeConfig) => {
    setThemeConfig(newConfig);
    if (!isOwner) return; // Only owner can save
    try {
      await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          socialLinks: {
            theme_config: newConfig,
          }
        })
      });
    } catch (err) {
      console.error("Failed to save theme update:", err);
    }
  };

  // Tier Gating checks
  const isTierAllowed = (feature: string, option: string): boolean => {
    const tierOrder = ["FREE", "RUBY", "SILVER", "GOLD", "PLATINUM", "DIAMOND"];
    const userRank = tierOrder.indexOf(performerTier.toUpperCase());

    if (feature === "underlay") {
      if (option === "grid") return userRank >= 1; // Ruby+
      if (option === "stars") return userRank >= 3; // Gold+
      if (option === "circuit") return userRank >= 2; // Silver+
    }
    if (feature === "overlay") {
      if (option === "smoke") return userRank >= 1; // Ruby+
      if (option === "lightning") return userRank >= 3; // Gold+
      if (option === "fire") return userRank >= 2; // Silver+
    }
    if (feature === "quoteStyle") {
      if (option === "neon") return userRank >= 1; // Ruby+
      if (option === "gold_foil") return userRank >= 3; // Gold+
      if (option === "holo") return userRank >= 2; // Silver+
    }
    if (feature === "customBg") {
      return userRank >= 5; // Diamond only
    }
    return true; // default free
  };

  // Preset visuals mapping
  const getPresetStyles = () => {
    switch (themeConfig.background) {
      case "gold":
        return {
          bgGradient: "radial-gradient(ellipse at bottom, #1f1803 0%, #030300 70%, #000000 100%)",
          border: "2px solid #FFD700",
          glow: "0 0 25px rgba(255,215,0,0.25)",
          accent: "#FFD700",
          glassBg: "rgba(31, 24, 3, 0.55)",
        };
      case "space":
        return {
          bgGradient: "radial-gradient(ellipse at bottom, #001f3b 0%, #01020a 70%, #000000 100%)",
          border: "2px solid #00FFFF",
          glow: "0 0 25px rgba(0,255,255,0.25)",
          accent: "#00FFFF",
          glassBg: "rgba(0, 31, 59, 0.45)",
        };
      case "retro":
        return {
          bgGradient: "radial-gradient(ellipse at bottom, #2b0024 0%, #07000d 70%, #000000 100%)",
          border: "2px solid #FF9500",
          glow: "0 0 25px rgba(255,149,0,0.25)",
          accent: "#FF9500",
          glassBg: "rgba(43, 0, 36, 0.45)",
        };
      case "cyber":
      default:
        return {
          bgGradient: "radial-gradient(ellipse at bottom, #1f0033 0%, #04000b 70%, #000000 100%)",
          border: "2px solid #FF2DAA",
          glow: "0 0 25px rgba(255,45,170,0.25)",
          accent: "#FF2DAA",
          glassBg: "rgba(31, 0, 51, 0.45)",
        };
    }
  };

  const currentTheme = getPresetStyles();

  // Custom visual layers
  const renderUnderlay = () => {
    if (themeConfig.underlay === "grid") {
      return (
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `linear-gradient(${currentTheme.accent}0a 1px, transparent 1px), linear-gradient(90deg, ${currentTheme.accent}0a 1px, transparent 1px)`,
          backgroundSize: "20px 20px", zIndex: 1, pointerEvents: "none"
        }} />
      );
    }
    if (themeConfig.underlay === "stars") {
      return (
        <div style={{ position: "absolute", inset: 0, zIndex: 1, overflow: "hidden", pointerEvents: "none" }}>
          {/* Simulated space sparkles */}
          <div style={{ position: "absolute", top: "20%", left: "15%", width: 3, height: 3, background: "#fff", borderRadius: "50%", boxShadow: "0 0 8px #fff", animation: "pulse 2s infinite" }} />
          <div style={{ position: "absolute", top: "60%", left: "80%", width: 2, height: 2, background: "#fff", borderRadius: "50%", boxShadow: "0 0 6px #fff", animation: "pulse 3s infinite" }} />
          <div style={{ position: "absolute", top: "75%", left: "30%", width: 3, height: 3, background: "#fff", borderRadius: "50%", boxShadow: "0 0 10px #fff", animation: "pulse 2.5s infinite" }} />
        </div>
      );
    }
    if (themeConfig.underlay === "circuit") {
      return (
        <div style={{
          position: "absolute", inset: 0, opacity: 0.12, zIndex: 1, pointerEvents: "none",
          backgroundImage: `radial-gradient(circle, ${currentTheme.accent} 10%, transparent 11%), radial-gradient(circle, ${currentTheme.accent} 10%, transparent 11%)`,
          backgroundSize: "40px 40px", backgroundPosition: "0 0, 20px 20px"
        }} />
      );
    }
    return null;
  };

  const renderOverlayEffect = () => {
    if (themeConfig.overlay === "smoke") {
      return (
        <div style={{
          position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
          background: "radial-gradient(circle at 50% 120%, rgba(255,255,255,0.03), transparent 70%)"
        }} />
      );
    }
    if (themeConfig.overlay === "fire") {
      return (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 100, zIndex: 2, pointerEvents: "none",
          background: "linear-gradient(to top, rgba(255, 68, 0, 0.08) 0%, transparent 100%)"
        }} />
      );
    }
    if (themeConfig.overlay === "lightning") {
      return (
        <div style={{
          position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none",
          background: "radial-gradient(circle at 10% 10%, rgba(0, 242, 254, 0.05), transparent 50%)"
        }} />
      );
    }
    return null;
  };

  const getQuoteStyle = () => {
    switch (themeConfig.quoteStyle) {
      case "neon":
        return {
          fontFamily: "'Courier New', Courier, monospace",
          color: "#fff",
          border: `1px solid ${currentTheme.accent}`,
          textShadow: `0 0 8px ${currentTheme.accent}`,
          background: "rgba(0,0,0,0.6)",
          padding: "16px",
          borderRadius: "10px",
          boxShadow: `inset 0 0 10px ${currentTheme.accent}30`
        };
      case "gold_foil":
        return {
          fontFamily: "Georgia, serif",
          color: "#FFD700",
          background: "linear-gradient(135deg, #151515 0%, #2a2a2a 100%)",
          border: "1px solid #FFD700",
          padding: "16px",
          borderRadius: "10px",
          fontStyle: "italic",
          boxShadow: "0 0 12px rgba(255,215,0,0.15)"
        };
      case "holo":
        return {
          fontFamily: "system-ui, sans-serif",
          color: "#fff",
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.25)",
          padding: "16px",
          borderRadius: "10px",
          backdropFilter: "blur(15px)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
        };
      case "simple":
      default:
        return {
          fontFamily: "system-ui, sans-serif",
          color: "#aabbcc",
          borderLeft: `3px solid ${currentTheme.accent}`,
          background: "rgba(255,255,255,0.02)",
          padding: "12px 16px",
          borderRadius: "0 8px 8px 0"
        };
    }
  };

  const handleShareCard = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: "relative",
        background: themeConfig.customBgUrl ? `url(${themeConfig.customBgUrl}) center/cover no-repeat` : currentTheme.bgGradient,
        border: currentTheme.border,
        boxShadow: currentTheme.glow,
        borderRadius: "20px",
        padding: "32px",
        overflow: "hidden",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Visual Effect Layers */}
      {renderUnderlay()}
      {renderOverlayEffect()}

      <div style={{ position: "relative", zIndex: 5, display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* Top Header Card Info */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>{themeConfig.emote}</span>
            <div>
              <span style={{ fontSize: 9, fontWeight: 950, letterSpacing: "0.2em", color: currentTheme.accent, textTransform: "uppercase" }}>
                YoPho Digital Card
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0, color: "#fff" }}>{performer.name}</h2>
                <span style={{ fontSize: 10, background: `${currentTheme.accent}20`, border: `1px solid ${currentTheme.accent}40`, color: currentTheme.accent, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", fontWeight: 800 }}>
                  {performerTier} MEMBER
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {isOwner && (
              <button
                type="button"
                onClick={() => setStudioOpen(!studioOpen)}
                style={{
                  padding: "8px 16px",
                  background: studioOpen ? currentTheme.accent : "rgba(255,255,255,0.05)",
                  border: `1px solid ${studioOpen ? "transparent" : "rgba(255,255,255,0.15)"}`,
                  color: studioOpen ? "#050510" : "#fff",
                  borderRadius: "8px",
                  fontSize: 11,
                  fontWeight: 900,
                  cursor: "pointer",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  transition: "all 0.2s"
                }}
              >
                🛠 Theme Studio
              </button>
            )}
            <button
              type="button"
              onClick={handleShareCard}
              style={{
                padding: "8px 16px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff",
                borderRadius: "8px",
                fontSize: 11,
                fontWeight: 900,
                cursor: "pointer",
                position: "relative"
              }}
            >
              {shareCopied ? "Link Copied!" : "Share Card"}
            </button>
          </div>
        </div>

        {/* Central Display Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          
          {/* Left Frame panel (Vibe, Quote, Booking) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Motto Card Quote Widget */}
            <div style={getQuoteStyle() as React.CSSProperties}>
              <div style={{ fontSize: 8, letterSpacing: "0.15em", color: currentTheme.accent, fontWeight: 950, marginBottom: 8, textTransform: "uppercase" }}>
                My Motto
              </div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>
                &ldquo;{themeConfig.motto || DEFAULT_THEME_CONFIG.motto}&rdquo;
              </p>
            </div>

            {/* Public Stats Deck */}
            <div style={{ background: currentTheme.glassBg, border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", padding: "16px", borderRadius: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700 }}>Rank</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: currentTheme.accent }}>#{performer.rank}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700 }}>XP Points</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{performer.xp.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700 }}>Followers</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{performer.fanCount.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700 }}>Likes</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{performer.likes.toLocaleString()}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowBooking((v) => !v)}
              style={{
                width: "100%",
                padding: "14px",
                background: currentTheme.accent,
                color: "#050510",
                fontWeight: 900,
                border: "none",
                borderRadius: "10px",
                fontSize: 12,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
                boxShadow: `0 0 15px ${currentTheme.accent}30`
              }}
            >
              {showBooking ? "Close Booking Panel" : "Book Performer"}
            </button>

            {showBooking && (
              <BookingCanister entityId={performer.slug} entityType="performer" accentColor={currentTheme.accent} />
            )}
          </div>

          {/* Right Frame panel (Interactive Playlist Player Widget) */}
          <div style={{ background: currentTheme.glassBg, border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", padding: "20px", borderRadius: "14px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ fontSize: 8, letterSpacing: "0.15em", color: currentTheme.accent, fontWeight: 950, textTransform: "uppercase", marginBottom: 12 }}>
                TMI Media Player
              </div>
              
              {/* Cover Art and Metadata */}
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 68, height: 68, borderRadius: 8, background: `linear-gradient(135deg, ${currentTheme.accent}40, #151525)`, border: `1px solid ${currentTheme.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
                  🎵
                </div>
                <div style={{ minWidth: 0 }}>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 900, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {currentTrack.title}
                  </h4>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                    {performer.name}
                  </p>
                  
                  {/* Bouncing visualizer bars when playing */}
                  {isPlaying && (
                    <div style={{ display: "flex", gap: 3, height: 12, marginTop: 8, alignItems: "flex-end" }}>
                      <div className="bar" style={{ width: 2, height: 12, background: currentTheme.accent, animation: "bounce 0.8s infinite alternate" }} />
                      <div className="bar" style={{ width: 2, height: 6, background: currentTheme.accent, animation: "bounce 0.5s infinite alternate 0.2s" }} />
                      <div className="bar" style={{ width: 2, height: 10, background: currentTheme.accent, animation: "bounce 0.7s infinite alternate 0.1s" }} />
                      <div className="bar" style={{ width: 2, height: 4, background: currentTheme.accent, animation: "bounce 0.4s infinite alternate 0.3s" }} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Scrub / Progress Bar */}
            <div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden", cursor: "pointer" }} onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                setTrackProgress((clickX / rect.width) * 100);
              }}>
                <div style={{ width: `${trackProgress}%`, height: "100%", background: currentTheme.accent, borderRadius: 2 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
                <span>0:00</span>
                <span>{Math.floor(currentTrack.durationSec / 60)}:{(currentTrack.durationSec % 60).toString().padStart(2, "0")}</span>
              </div>
            </div>

            {/* Player Controllers */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTrackIndex((idx) => (idx - 1 + playlist.length) % playlist.length);
                    setTrackProgress(0);
                  }}
                  style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 16 }}
                >
                  ⏮
                </button>
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  style={{ width: 38, height: 38, borderRadius: "50%", background: "#fff", color: "#050510", border: "none", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}
                >
                  {isPlaying ? "⏸" : "▶"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTrackIndex((idx) => (idx + 1) % playlist.length);
                    setTrackProgress(0);
                  }}
                  style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: 16 }}
                >
                  ⏭
                </button>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setPlaylistAdded(!playlistAdded)}
                  title="Add to Library"
                  style={{ background: "none", border: "none", color: playlistAdded ? currentTheme.accent : "rgba(255,255,255,0.35)", cursor: "pointer", fontSize: 16 }}
                >
                  {playlistAdded ? "💖" : "➕"}
                </button>
              </div>
            </div>

            {/* Tracklist table */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 8, maxHeight: 150, overflowY: "auto" }}>
              {playlist.map((track: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentTrackIndex(idx);
                    setTrackProgress(0);
                    setIsPlaying(true);
                  }}
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px", background: idx === currentTrackIndex ? `${currentTheme.accent}12` : "transparent",
                    border: "none", borderRadius: "6px", cursor: "pointer", textAlign: "left",
                    color: idx === currentTrackIndex ? currentTheme.accent : "#fff",
                    fontSize: 12, transition: "background 0.2s"
                  }}
                >
                  <span style={{ fontWeight: idx === currentTrackIndex ? 900 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
                    {idx + 1}. {track.title}
                  </span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                    {Math.floor(track.durationSec / 60)}:{(track.durationSec % 60).toString().padStart(2, "0")}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3D Integration Pass Panels */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginTop: 24, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24 }}>
          
          {/* 3D Venues connection panel */}
          <div style={{ background: currentTheme.glassBg, border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", padding: "20px", borderRadius: "14px", display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 955, color: currentTheme.accent, textTransform: "uppercase", letterSpacing: "0.15em" }}>
              🏟 Connected 3D Venues
            </h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { type: "Home Venue", label: "World Concert", skin: "stadium" },
                { type: "Current Venue", label: "Cypher Arena", skin: "theater" },
                { type: "Favorite Venue", label: "Battle Arena", skin: "stadium" },
                { type: "Upcoming Venue", label: "Monday Stage", skin: "theater" },
              ].map((venue) => (
                <div key={venue.type} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", padding: "10px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700 }}>{venue.type}</span>
                    <span style={{ fontSize: 9, color: currentTheme.accent, fontWeight: 800 }}>LIVE</span>
                  </div>
                  <VenuePreviewCanvas skin={themeConfig.venueSkin || venue.skin} accentColor={currentTheme.accent} />
                  <div style={{ fontSize: 11, fontWeight: "bold", color: "#fff", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                    {venue.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3D Lobby connection panel */}
          <div style={{ background: currentTheme.glassBg, border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", padding: "20px", borderRadius: "14px", display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 955, color: currentTheme.accent, textTransform: "uppercase", letterSpacing: "0.15em" }}>
              🎮 3D Lobby Connections
            </h3>
            
            <div style={{ position: "relative", height: 160, borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
              <AvatarLobbyCanvas activeCount={5} />
              <div style={{ position: "absolute", bottom: 8, left: 8, zIndex: 10, background: "rgba(0,0,0,0.7)", padding: "4px 8px", borderRadius: 4, fontSize: 10, color: "#fff", fontWeight: 700 }}>
                🟢 {themeConfig.lobbySkin.replace("-", " ").toUpperCase()}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>
                Friends Currently Inside
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Astra_X", "Marcel_K", "Wavetek", "Bar_God", "Nova_K"].map((name) => (
                  <span key={name} style={{ fontSize: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", padding: "4px 10px", borderRadius: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                    👤 {name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 3D Room & Interactive Seating Map */}
          <div style={{ background: currentTheme.glassBg, border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(10px)", padding: "20px", borderRadius: "14px", display: "flex", flexDirection: "column", gap: 16 }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 955, color: currentTheme.accent, textTransform: "uppercase", letterSpacing: "0.15em" }}>
              🛋️ Room & Seating Map
            </h3>

            {/* Room List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,255,255,0.06)", border: "1px solid rgba(0,255,255,0.15)", borderRadius: 8, padding: "8px 12px" }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: "bold", color: "#fff" }}>Cyber Jam Live</span>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>Skin: {themeConfig.roomSkin.replace("-", " ").toUpperCase()}</div>
                </div>
                <span style={{ fontSize: 9, background: "#00FFFF", color: "#050510", fontWeight: "900", padding: "2px 6px", borderRadius: 4 }}>LIVE</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8, padding: "8px 12px" }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: "bold", color: "rgba(255,255,255,0.6)" }}>Monday Beats</span>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>Starts in 2 hours</div>
                </div>
                <span style={{ fontSize: 9, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)", fontWeight: "bold", padding: "2px 6px", borderRadius: 4 }}>SCHEDULED</span>
              </div>
            </div>

            {/* Seating Engine Grid */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700 }}>
                  Interactive Seating Map
                </span>
                <span style={{ fontSize: 10, color: currentTheme.accent, fontWeight: "bold" }}>
                  Preferred: VIP Section
                </span>
              </div>
              <SeatingMapGrid accentColor={currentTheme.accent} />
            </div>
          </div>
        </div>

      </div>
    </div>

      {/* Slide-out Theme Studio Drawer Overlay */}
      {isOwner && studioOpen && (
        <div
          style={{
            position: "absolute", top: 0, right: 0, bottom: 0, width: 320,
            background: "rgba(10,10,20,0.98)", borderLeft: `1px solid ${currentTheme.accent}30`,
            zIndex: 100, padding: "24px", display: "flex", flexDirection: "column", gap: 20,
            boxShadow: "-10px 0 40px rgba(0,0,0,0.8)", backdropFilter: "blur(20px)",
            overflowY: "auto"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: "#fff", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Theme Studio
            </h3>
            <button
              type="button"
              onClick={() => setStudioOpen(false)}
              style={{ background: "none", border: "none", color: "#fff", fontSize: 16, cursor: "pointer" }}
            >
              ✕
            </button>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.1)", margin: 0 }} />

          {/* Background Presets */}
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, color: currentTheme.accent, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
              Preset Backgrounds
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {(["cyber", "gold", "space", "retro"] as const).map((bg) => (
                <button
                  key={bg}
                  onClick={() => saveThemeConfig({ ...themeConfig, background: bg })}
                  style={{
                    padding: "8px", background: themeConfig.background === bg ? currentTheme.accent : "rgba(255,255,255,0.05)",
                    border: "none", borderRadius: "6px", color: themeConfig.background === bg ? "#050510" : "#fff",
                    fontSize: 11, fontWeight: "bold", cursor: "pointer", textTransform: "capitalize"
                  }}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Underlay Selection */}
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, color: currentTheme.accent, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
              Underlays / Patterns
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(["none", "grid", "stars", "circuit"] as const).map((opt) => {
                const allowed = isTierAllowed("underlay", opt);
                return (
                  <button
                    key={opt}
                    onClick={() => allowed && saveThemeConfig({ ...themeConfig, underlay: opt })}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 12px", background: themeConfig.underlay === opt ? `${currentTheme.accent}20` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${themeConfig.underlay === opt ? currentTheme.accent : "transparent"}`, borderRadius: "6px",
                      color: allowed ? "#fff" : "rgba(255,255,255,0.25)", fontSize: 11, cursor: allowed ? "pointer" : "not-allowed",
                      textAlign: "left"
                    }}
                  >
                    <span style={{ textTransform: "capitalize" }}>{opt}</span>
                    {!allowed && <span style={{ fontSize: 10 }}>🔒 Upgrade</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Overlay Selection */}
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, color: currentTheme.accent, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
              Overlays / Particles
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(["none", "smoke", "lightning", "fire"] as const).map((opt) => {
                const allowed = isTierAllowed("overlay", opt);
                return (
                  <button
                    key={opt}
                    onClick={() => allowed && saveThemeConfig({ ...themeConfig, overlay: opt })}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 12px", background: themeConfig.overlay === opt ? `${currentTheme.accent}20` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${themeConfig.overlay === opt ? currentTheme.accent : "transparent"}`, borderRadius: "6px",
                      color: allowed ? "#fff" : "rgba(255,255,255,0.25)", fontSize: 11, cursor: allowed ? "pointer" : "not-allowed",
                      textAlign: "left"
                    }}
                  >
                    <span style={{ textTransform: "capitalize" }}>{opt}</span>
                    {!allowed && <span style={{ fontSize: 10 }}>🔒 Upgrade</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quote Card Style */}
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, color: currentTheme.accent, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
              Quote Style
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(["simple", "neon", "gold_foil", "holo"] as const).map((opt) => {
                const allowed = isTierAllowed("quoteStyle", opt);
                return (
                  <button
                    key={opt}
                    onClick={() => allowed && saveThemeConfig({ ...themeConfig, quoteStyle: opt })}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 12px", background: themeConfig.quoteStyle === opt ? `${currentTheme.accent}20` : "rgba(255,255,255,0.03)",
                      border: `1px solid ${themeConfig.quoteStyle === opt ? currentTheme.accent : "transparent"}`, borderRadius: "6px",
                      color: allowed ? "#fff" : "rgba(255,255,255,0.25)", fontSize: 11, cursor: allowed ? "pointer" : "not-allowed",
                      textAlign: "left"
                    }}
                  >
                    <span style={{ textTransform: "capitalize" }}>{opt.replace("_", " ")}</span>
                    {!allowed && <span style={{ fontSize: 10 }}>🔒 Upgrade</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card Emote */}
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, color: currentTheme.accent, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
              Card Emote Badge
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              {["🔥", "⚡", "💖", "💎", "👑"].map((emo) => (
                <button
                  key={emo}
                  onClick={() => saveThemeConfig({ ...themeConfig, emote: emo })}
                  style={{
                    flex: 1, padding: "8px", background: themeConfig.emote === emo ? "rgba(255,255,255,0.15)" : "transparent",
                    border: `1px solid ${themeConfig.emote === emo ? currentTheme.accent : "rgba(255,255,255,0.1)"}`,
                    borderRadius: "6px", fontSize: 14, cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  {emo}
                </button>
              ))}
            </div>
          </div>

          {/* Motto Input */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 800, color: currentTheme.accent, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
              Custom Motto Quote
            </label>
            <input
              type="text"
              value={themeConfig.motto}
              onChange={(e) => saveThemeConfig({ ...themeConfig, motto: e.target.value })}
              style={{
                width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px",
                color: "#fff", fontSize: 12, outline: "none"
              }}
            />
          </div>

          {/* Custom Background Image URL (Diamond Tier) */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 800, color: currentTheme.accent, letterSpacing: "0.1em", textTransform: "uppercase", display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span>Custom BG Image URL</span>
              {!isTierAllowed("customBg", "") && <span style={{ fontSize: 9 }}>🔒 Diamond Only</span>}
            </label>
            <input
              type="text"
              placeholder="https://..."
              value={customBgInput}
              disabled={!isTierAllowed("customBg", "")}
              onChange={(e) => {
                setCustomBgInput(e.target.value);
                saveThemeConfig({ ...themeConfig, customBgUrl: e.target.value || undefined });
              }}
              style={{
                width: "100%", padding: "10px", background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px",
                color: isTierAllowed("customBg", "") ? "#fff" : "rgba(255,255,255,0.2)",
                fontSize: 12, outline: "none", cursor: isTierAllowed("customBg", "") ? "text" : "not-allowed"
              }}
            />
          </div>

          {/* 3D Customizer Settings */}
          <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.1)", margin: "4px 0" }} />
          
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, color: currentTheme.accent, letterSpacing: "0.15em", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
              🤖 3D World Settings
            </span>
            
            {/* 3D Avatar Mode Toggle */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: "#fff", fontWeight: "bold" }}>3D Virtual Avatar Mode</span>
              <button
                type="button"
                onClick={() => saveThemeConfig({ ...themeConfig, avatarMode: !themeConfig.avatarMode })}
                style={{
                  padding: "5px 12px",
                  borderRadius: "6px",
                  fontSize: 10,
                  fontWeight: 900,
                  cursor: "pointer",
                  background: themeConfig.avatarMode ? currentTheme.accent : "rgba(255,255,255,0.05)",
                  color: themeConfig.avatarMode ? "#050510" : "#fff",
                  border: "none",
                }}
              >
                {themeConfig.avatarMode ? "ENABLED" : "DISABLED"}
              </button>
            </div>

            {/* Lobby Skin Selector */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 4 }}>
                Lobby Skin
              </label>
              <select
                value={themeConfig.lobbySkin}
                onChange={(e) => saveThemeConfig({ ...themeConfig, lobbySkin: e.target.value })}
                style={{ width: "100%", padding: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", color: "#fff", fontSize: 11, outline: "none" }}
              >
                <option value="cypher-entrance">🎤 Cypher Entrance</option>
                <option value="arena-tunnel">🏟️ Stadium Tunnel</option>
                <option value="green-room">🛋️ VIP Green Room</option>
              </select>
            </div>

            {/* Room Skin Selector */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 4 }}>
                Room Skin
              </label>
              <select
                value={themeConfig.roomSkin}
                onChange={(e) => saveThemeConfig({ ...themeConfig, roomSkin: e.target.value })}
                style={{ width: "100%", padding: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", color: "#fff", fontSize: 11, outline: "none" }}
              >
                <option value="studio-suite">📻 Studio Suite</option>
                <option value="vip-suite">⭐ VIP Lounge</option>
                <option value="main-hall">🔊 Main Hall</option>
              </select>
            </div>

            {/* Venue Skin Selector */}
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", fontWeight: 700, display: "block", marginBottom: 4 }}>
                Venue Skin
              </label>
              <select
                value={themeConfig.venueSkin}
                onChange={(e) => saveThemeConfig({ ...themeConfig, venueSkin: e.target.value })}
                style={{ width: "100%", padding: "8px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", color: "#fff", fontSize: 11, outline: "none" }}
              >
                <option value="theater">🎬 Classic Theater</option>
                <option value="stadium">🏟️ Mega Stadium</option>
                <option value="club">🌌 Neon Club</option>
                <option value="outdoor">🌳 Outdoor Fest</option>
                <option value="boardroom">💼 Corporate Boardroom</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS Style tag for visualizer bounce animations */}
      <style jsx global>{`
        @keyframes bounce {
          from { height: 3px; }
          to { height: 12px; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* Owner Control Panel */}
      {isOwner && (
        <div
          style={{
            marginTop: "32px",
            padding: "20px",
            border: "1px solid rgba(0, 255, 136, 0.3)",
            background: "rgba(0, 255, 136, 0.04)",
            borderRadius: "16px",
            textAlign: "center",
            backdropFilter: "blur(8px)",
          }}
        >
          <p style={{ margin: "0 0 12px 0", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
            You are viewing your public YoPho Identity page. Toggle the Theme Studio to customize it.
          </p>
          <Link
            href="/hub/performer"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              background: "#00FF88",
              color: "#050510",
              fontWeight: "900",
              borderRadius: "8px",
              textDecoration: "none",
              textTransform: "uppercase",
              fontSize: "12px",
              letterSpacing: "0.1em",
              boxShadow: "0 0 15px rgba(0,255,136,0.3)"
            }}
          >
            Back to Performer Hub
          </Link>
        </div>
      )}
      </div>
    </ProfileShell>
  );
}
