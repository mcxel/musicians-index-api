import Link from "next/link";
import MotionPortraitEngine from "@/components/avatar/MotionPortraitEngine";

type ArtistSpotlightTileProps = {
  artistName: string;
  blurb: string;
  statLabel: string;
  statValue: string;
  accent: string;
};

export default function ArtistSpotlightTile({ artistName, blurb, statLabel, statValue, accent }: ArtistSpotlightTileProps) {
  return (
    <Link
      href="/artists"
      style={{
        textDecoration: "none",
        color: "#fff",
        display: "block",
        borderRadius: 14,
        border: `1px solid ${accent}55`,
        background: `linear-gradient(150deg, ${accent}1f, rgba(255,255,255,0.08), rgba(255,255,255,0.03))`,
        padding: "14px 14px 12px",
      }}
      className="hover-glow"
    >
      <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: accent, marginBottom: 8 }}>Artist Spotlight</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 76, display: "grid", placeItems: "center" }}>
          <MotionPortraitEngine
            name={artistName}
            accent={accent}
            mode="circle"
            gesture="talk"
            loopPreset="standard"
          />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 900, lineHeight: 1.1 }}>{artistName}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.72)", marginTop: 3 }}>{blurb}</div>
        </div>
      </div>
      <div style={{ marginTop: 10, fontSize: 10, color: "rgba(255,255,255,0.8)", display: "flex", justifyContent: "space-between" }}>
        <span>{statLabel}</span>
        <span style={{ color: accent, fontWeight: 800 }}>{statValue}</span>
      </div>
    </Link>
  );
}
