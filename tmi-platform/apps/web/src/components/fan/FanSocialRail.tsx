// Fan Social Rail — following artists, voted battles, recent activity.
// Server component.

import Link from "next/link";

interface FollowedArtist {
  slug: string;
  displayName: string;
  rank?: number;
  accentColor?: string;
}

interface VotedBattle {
  id: string;
  label: string;
  artistSlug: string;
  artistName: string;
  outcome: "won" | "lost" | "pending";
  date: string;
}

interface FanSocialRailProps {
  followedArtists?: FollowedArtist[];
  votedBattles?: VotedBattle[];
  fanSlug: string;
}

const ACCENT = "#FFD700";

export default function FanSocialRail({
  followedArtists = [],
  votedBattles = [],
  fanSlug,
}: FanSocialRailProps) {
  return (
    <section style={{ marginBottom: 28 }}>
      {/* Following */}
      <div style={{ marginBottom: 22 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
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
            Following
          </span>
          <Link
            href={`/fans/${fanSlug}/following`}
            style={{
              fontSize: 7,
              fontWeight: 700,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            All →
          </Link>
        </div>

        {followedArtists.length === 0 ? (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", margin: 0 }}>Not following any artists yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {followedArtists.slice(0, 5).map((artist) => (
              <Link
                key={artist.slug}
                href={`/profile/artist/${artist.slug}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.07)",
                    background: "rgba(255,255,255,0.02)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: `${artist.accentColor ?? "#00FFFF"}18`,
                        border: `1px solid ${artist.accentColor ?? "#00FFFF"}30`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        flexShrink: 0,
                      }}
                    >
                      🎤
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>{artist.displayName}</span>
                  </div>
                  {artist.rank !== undefined && (
                    <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>#{artist.rank}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Voted battles */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
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
            Battle Votes
          </span>
          <Link
            href={`/fans/${fanSlug}/votes`}
            style={{
              fontSize: 7,
              fontWeight: 700,
              color: "rgba(255,255,255,0.3)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              textDecoration: "none",
            }}
          >
            History →
          </Link>
        </div>

        {votedBattles.length === 0 ? (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", margin: 0 }}>No battle votes yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {votedBattles.slice(0, 5).map((battle) => {
              const outcomeColor =
                battle.outcome === "won" ? "#4ade80" : battle.outcome === "lost" ? "#f87171" : "rgba(255,255,255,0.4)";
              return (
                <div
                  key={battle.id}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.02)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#fff", margin: 0 }}>{battle.label}</p>
                    <Link
                      href={`/profile/artist/${battle.artistSlug}`}
                      style={{ fontSize: 8, color: "#00FFFF", textDecoration: "none" }}
                    >
                      {battle.artistName}
                    </Link>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ fontSize: 8, fontWeight: 900, color: outcomeColor, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      {battle.outcome}
                    </span>
                    <p style={{ fontSize: 7, color: "rgba(255,255,255,0.25)", margin: 0 }}>{battle.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
