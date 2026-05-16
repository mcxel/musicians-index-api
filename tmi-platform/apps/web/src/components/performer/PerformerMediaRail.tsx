// Performer Media Rail — clips, featured videos, audio previews.
// Server component.

import Link from "next/link";

interface MediaItem {
  id: string;
  title: string;
  type: "clip" | "audio" | "photo";
  thumbnailUrl?: string;
  duration?: string;
  viewCount?: number;
  route: string;
}

interface PerformerMediaRailProps {
  media?: MediaItem[];
  performerSlug: string;
}

const ACCENT = "#FF2DAA";

const TYPE_ICON: Record<MediaItem["type"], string> = {
  clip: "🎬",
  audio: "🎵",
  photo: "📸",
};

export default function PerformerMediaRail({
  media = [],
  performerSlug,
}: PerformerMediaRailProps) {
  return (
    <section style={{ marginBottom: 28 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontSize: 7,
            fontWeight: 900,
            letterSpacing: "0.28em",
            color: ACCENT,
            textTransform: "uppercase",
          }}
        >
          Media
        </span>
        <Link
          href={`/media?performer=${performerSlug}`}
          style={{
            fontSize: 7,
            fontWeight: 700,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            textDecoration: "none",
          }}
        >
          All Media →
        </Link>
      </div>

      {media.length === 0 ? (
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", margin: 0 }}>No media uploaded yet.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {media.slice(0, 4).map((item) => (
            <Link key={item.id} href={item.route} style={{ textDecoration: "none" }}>
              <div
                style={{
                  borderRadius: 10,
                  border: `1px solid ${ACCENT}20`,
                  background: `${ACCENT}05`,
                  overflow: "hidden",
                  transition: "border-color 150ms ease",
                }}
              >
                {/* Thumbnail / placeholder */}
                <div
                  style={{
                    height: 90,
                    background: item.thumbnailUrl
                      ? `url(${item.thumbnailUrl}) center/cover no-repeat`
                      : `${ACCENT}0a`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                  }}
                >
                  {!item.thumbnailUrl && TYPE_ICON[item.type]}
                </div>

                <div style={{ padding: "8px 10px" }}>
                  <p
                    style={{
                      fontSize: 9,
                      fontWeight: 700,
                      color: "#fff",
                      margin: "0 0 3px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.title}
                  </p>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 7, color: "rgba(255,255,255,0.3)" }}>
                      {TYPE_ICON[item.type]} {item.type}
                    </span>
                    {item.duration && (
                      <span style={{ fontSize: 7, color: "rgba(255,255,255,0.25)" }}>{item.duration}</span>
                    )}
                    {item.viewCount !== undefined && (
                      <span style={{ fontSize: 7, color: "rgba(255,255,255,0.25)" }}>
                        {item.viewCount.toLocaleString()} views
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
