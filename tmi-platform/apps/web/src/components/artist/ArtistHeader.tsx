"use client";
import { motion } from "framer-motion";

interface ArtistHeaderProps {
  artist: {
    id: string;
    stageName: string | null;
    genres: string[];
    followers: number;
    views: number;
    verified: boolean;
    slug: string | null;
    user?: { name: string | null; image: string | null } | null;
  };
}

const GENRE_COLORS: Record<string, string> = {
  "Hip-Hop": "#00FFFF", "R&B": "#FF2DAA", "Neo-Soul": "#AA2DFF",
  "Trap": "#FFD700", "Soul": "#FF2DAA", "Pop": "#FF6B2D",
};
function genreColor(g: string) {
  return GENRE_COLORS[g] ?? "#00FFFF";
}
function fmtCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

export default function ArtistHeader({ artist }: ArtistHeaderProps) {
  const name = (artist.stageName ?? artist.user?.name ?? "Unknown Artist").toUpperCase();
  const primaryColor = artist.genres[0] ? genreColor(artist.genres[0]) : "#00FFFF";
  const avatar = artist.user?.image ?? null;

  return (
    <div style={{ position: "relative", overflow: "hidden", marginBottom: 0 }}>
      {/* Banner */}
      <div style={{
        height: 220,
        background: `linear-gradient(135deg, ${primaryColor}18 0%, #060610 60%, #0A0010 100%)`,
        borderBottom: `1px solid ${primaryColor}22`,
        position: "relative",
      }}>
        {/* Neon glow orb */}
        <div style={{
          position: "absolute", top: -60, left: "30%",
          width: 300, height: 300, borderRadius: "50%",
          background: `radial-gradient(circle, ${primaryColor}14 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
        {/* HUD corner TL */}
        <div style={{ position: "absolute", top: 16, left: 16, width: 16, height: 16, borderTop: `2px solid ${primaryColor}60`, borderLeft: `2px solid ${primaryColor}60` }} />
        {/* HUD corner TR */}
        <div style={{ position: "absolute", top: 16, right: 16, width: 16, height: 16, borderTop: `2px solid ${primaryColor}60`, borderRight: `2px solid ${primaryColor}60` }} />
      </div>

      {/* Profile row */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginTop: -56, marginBottom: 32 }}>
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              width: 112, height: 112, borderRadius: "50%",
              border: `3px solid ${primaryColor}`,
              boxShadow: `0 0 24px ${primaryColor}50, 0 0 60px ${primaryColor}20`,
              background: avatar ? undefined : `linear-gradient(135deg, ${primaryColor}30 0%, #0A0A1A 100%)`,
              flexShrink: 0,
              overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ fontSize: 36, fontWeight: 900, color: primaryColor, opacity: 0.6 }}>
                {name.charAt(0)}
              </div>
            )}
          </motion.div>

          {/* Name + meta */}
          <div style={{ paddingBottom: 8, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                style={{
                  margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: "0.08em",
                  color: "white", textShadow: `0 0 30px ${primaryColor}40`,
                }}
              >
                {name}
              </motion.h1>
              {artist.verified && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  style={{
                    background: primaryColor, color: "#000", fontSize: 9, fontWeight: 900,
                    padding: "3px 8px", borderRadius: 4, letterSpacing: "0.15em",
                  }}
                >
                  ✓ VERIFIED
                </motion.div>
              )}
            </div>
            {/* Genre chips */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {artist.genres.slice(0, 4).map((g) => (
                <span key={g} style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.15em",
                  textTransform: "uppercase", color: genreColor(g),
                  border: `1px solid ${genreColor(g)}40`,
                  borderRadius: 4, padding: "2px 8px",
                }}>{g}</span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: 24, paddingBottom: 8 }}>
            {[
              { label: "FOLLOWERS", value: fmtCount(artist.followers) },
              { label: "VIEWS", value: fmtCount(artist.views) },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: primaryColor }}>{s.value}</div>
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.4)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
