interface MusicLink { platform: string; url: string; }
interface ArtistMusicProps { musicLinks: MusicLink[]; }

const PLATFORM_COLORS: Record<string, string> = {
  spotify: "#1DB954", apple: "#FF2DAA", youtube: "#FF0000",
  soundcloud: "#FF5500", tidal: "#00FFFF", bandcamp: "#2DFFAA",
};
const PLATFORM_ICONS: Record<string, string> = {
  spotify: "♫", apple: "♪", youtube: "▶",
  soundcloud: "☁", tidal: "〜", bandcamp: "◉",
};

export default function ArtistMusic({ musicLinks }: ArtistMusicProps) {
  if (!musicLinks || musicLinks.length === 0) return null;
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 10,
      padding: "20px 24px",
      marginBottom: 20,
    }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>
        LISTEN ON
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {musicLinks.map((link) => {
          const key = link.platform.toLowerCase();
          const color = PLATFORM_COLORS[key] ?? "#00FFFF";
          const icon = PLATFORM_ICONS[key] ?? "♫";
          return (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 16px", borderRadius: 8,
                background: `${color}12`,
                border: `1px solid ${color}40`,
                textDecoration: "none", cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: 14, color }}>{icon}</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "capitalize", color }}>{
                link.platform.charAt(0).toUpperCase() + link.platform.slice(1)
              }</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
