"use client";

/**
 * Home5YearlyContestBoard.tsx
 * Section F — YEARLY CONTEST
 * Monthly winners bracket, wildcard slots, sponsor picks.
 * Premium visual: gold borders, trophy artifacts, bracket display.
 */

import Link from "next/link";

interface MonthlyWinner {
  month: string;
  artistName: string;
  genre: string;
  avatar?: string;
  points: number;
  qualified: boolean;
}

interface WildcardSlot {
  id: number;
  artistName?: string;
  avatar?: string;
  filled: boolean;
  type: "community" | "sponsor";
}

const MONTHLY_WINNERS: MonthlyWinner[] = [
  { month: "JAN", artistName: "Nova Jay", genre: "Hip Hop", avatar: "/artists/artist-01.png", points: 18500, qualified: true },
  { month: "FEB", artistName: "Renegade K", genre: "R&B", avatar: "/artists/artist-02.png", points: 16200, qualified: true },
  { month: "MAR", artistName: "Astra Nova", genre: "Pop", avatar: "/artists/artist-03.png", points: 21000, qualified: true },
  { month: "APR", artistName: "Lynx MC", genre: "Country", avatar: "/artists/artist-04.png", points: 14800, qualified: true },
  { month: "MAY", artistName: "Pulse", genre: "EDM", avatar: "/artists/artist-05.png", points: 19300, qualified: true },
  { month: "JUN", artistName: "Team Neon", genre: "Jazz", avatar: "/artists/artist-06.png", points: 15600, qualified: true },
  { month: "JUL", artistName: "Solar Beat", genre: "Afrobeat", avatar: "/artists/artist-07.png", points: 17400, qualified: true },
  { month: "AUG", artistName: "Cipher Queen", genre: "Gospel", avatar: "/artists/artist-08.png", points: 22100, qualified: true },
  { month: "SEP", artistName: "—", genre: "", points: 0, qualified: false },
  { month: "OCT", artistName: "—", genre: "", points: 0, qualified: false },
  { month: "NOV", artistName: "—", genre: "", points: 0, qualified: false },
  { month: "DEC", artistName: "—", genre: "", points: 0, qualified: false },
];

const WILDCARDS: WildcardSlot[] = [
  { id: 1, artistName: "Keys Master", avatar: "/artists/artist-09.png", filled: true, type: "community" },
  { id: 2, artistName: "Road Host", avatar: "/artists/artist-10.png", filled: true, type: "community" },
  { id: 3, artistName: "DJ Crown", filled: true, type: "sponsor" },
  { id: 4, filled: false, type: "community" },
  { id: 5, filled: false, type: "community" },
];

export default function Home5YearlyContestBoard() {
  const qualified = MONTHLY_WINNERS.filter((w) => w.qualified);
  const pending = MONTHLY_WINNERS.filter((w) => !w.qualified);

  return (
    <section
      style={{
        border: "1px solid rgba(255,215,0,0.3)",
        borderRadius: 14,
        background: "linear-gradient(135deg, rgba(255,215,0,0.05) 0%, rgba(5,5,16,0.99) 100%)",
        padding: 20,
        display: "grid",
        gap: 18,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 24 }}>🏆</span>
        <div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 900,
              fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', Impact, sans-serif)",
              letterSpacing: "0.1em",
              color: "#FFD700",
              textShadow: "0 0 16px rgba(255,215,0,0.4)",
            }}
          >
            YEARLY GRAND CONTEST
          </div>
          <div style={{ fontSize: 11, opacity: 0.6 }}>
            {qualified.length}/12 monthly winners qualified
          </div>
        </div>
        <Link
          href="/contests/yearly"
          style={{
            marginLeft: "auto",
            fontSize: 11,
            color: "#FFD700",
            textDecoration: "none",
            opacity: 0.8,
          }}
        >
          Full Bracket →
        </Link>
      </div>

      {/* Monthly winners grid */}
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", opacity: 0.6 }}>
          MONTHLY CHAMPIONS
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            gap: 6,
          }}
        >
          {MONTHLY_WINNERS.map((w) => (
            <div
              key={w.month}
              style={{
                border: `1px solid ${w.qualified ? "rgba(255,215,0,0.4)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 8,
                padding: 8,
                background: w.qualified
                  ? "rgba(255,215,0,0.06)"
                  : "rgba(255,255,255,0.02)",
                textAlign: "center",
                opacity: w.qualified ? 1 : 0.5,
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: w.qualified ? "#FFD700" : "rgba(255,255,255,0.4)",
                  letterSpacing: "0.06em",
                  marginBottom: 4,
                }}
              >
                {w.month}
              </div>
              {w.qualified ? (
                <>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: w.avatar
                        ? `url(${w.avatar}) center/cover`
                        : "rgba(255,215,0,0.3)",
                      border: "1px solid rgba(255,215,0,0.5)",
                      margin: "0 auto 4px",
                    }}
                  />
                  <div style={{ fontSize: 9, fontWeight: 700, lineHeight: 1.2 }}>
                    {w.artistName.split(" ")[0]}
                  </div>
                  <div style={{ fontSize: 8, color: "#FFD700", opacity: 0.8 }}>
                    {(w.points / 1000).toFixed(0)}k
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 11, opacity: 0.4, paddingTop: 4 }}>?</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Wildcard slots */}
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", opacity: 0.6 }}>
          WILDCARD SLOTS (5 available)
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 6,
          }}
        >
          {WILDCARDS.map((slot) => (
            <div
              key={slot.id}
              style={{
                border: `1px solid ${slot.filled ? (slot.type === "sponsor" ? "rgba(170,45,255,0.5)" : "rgba(0,255,136,0.4)") : "rgba(255,255,255,0.12)"}`,
                borderRadius: 8,
                padding: 8,
                background: slot.filled
                  ? slot.type === "sponsor"
                    ? "rgba(170,45,255,0.08)"
                    : "rgba(0,255,136,0.06)"
                  : "rgba(255,255,255,0.02)",
                textAlign: "center",
              }}
            >
              {slot.filled ? (
                <>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: slot.avatar
                        ? `url(${slot.avatar}) center/cover`
                        : slot.type === "sponsor"
                        ? "rgba(170,45,255,0.3)"
                        : "rgba(0,255,136,0.3)",
                      border: `1px solid ${slot.type === "sponsor" ? "rgba(170,45,255,0.5)" : "rgba(0,255,136,0.4)"}`,
                      margin: "0 auto 4px",
                    }}
                  />
                  <div style={{ fontSize: 9, fontWeight: 700, lineHeight: 1.2 }}>
                    {slot.artistName ?? "Artist"}
                  </div>
                  <div
                    style={{
                      fontSize: 8,
                      color: slot.type === "sponsor" ? "#AA2DFF" : "#00FF88",
                      opacity: 0.8,
                      marginTop: 2,
                    }}
                  >
                    {slot.type === "sponsor" ? "SPONSOR" : "WILD"}
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px dashed rgba(255,255,255,0.15)",
                      margin: "0 auto 4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                    }}
                  >
                    +
                  </div>
                  <div style={{ fontSize: 8, opacity: 0.4 }}>Open</div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ display: "flex", gap: 10 }}>
        <Link
          href="/contests"
          style={{
            background: "linear-gradient(135deg, #FFD700, #FF6B35)",
            color: "#000",
            borderRadius: 8,
            padding: "10px 20px",
            fontWeight: 900,
            fontSize: 13,
            textDecoration: "none",
            letterSpacing: "0.08em",
            fontFamily: "var(--font-tmi-bebas, 'Bebas Neue', Impact, sans-serif)",
          }}
        >
          QUALIFY FOR YEARLY
        </Link>
        <Link
          href="/contests"
          style={{
            background: "rgba(255,215,0,0.1)",
            border: "1px solid rgba(255,215,0,0.3)",
            color: "#FFD700",
            borderRadius: 8,
            padding: "10px 20px",
            fontWeight: 700,
            fontSize: 13,
            textDecoration: "none",
          }}
        >
          Full Bracket
        </Link>
      </div>
    </section>
  );
}
