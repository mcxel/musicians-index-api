import Link from "next/link";
import type { Metadata } from "next";
import { getTopPerformers } from "@/lib/performers/PerformerRegistry";

export const metadata: Metadata = {
  title: "Fan Club | TMI",
  description:
    "Join a TMI artist's fan club. Exclusive content, early access, and direct connection with your favorite artists.",
};

const TIER_COLOR: Record<string, string> = {
  FREE:     "rgba(255,255,255,0.4)",
  PRO:      "#00FF88",
  RUBY:     "#CD5C5C",
  Silver:   "#C0C0C0",
  Gold:     "#FFD700",
  Platinum: "#00FFFF",
  Diamond:  "#AA2DFF",
};

export default function FanClubPage() {
  const performers = getTopPerformers(12);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050510",
        color: "#fff",
        paddingBottom: 80,
      }}
    >
      <section
        style={{
          textAlign: "center",
          padding: "56px 24px 40px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.4em",
            color: "#FF2DAA",
            fontWeight: 800,
            marginBottom: 10,
          }}
        >
          TMI FAN CLUBS
        </div>
        <h1
          style={{
            fontSize: "clamp(1.6rem,4vw,2.8rem)",
            fontWeight: 900,
            marginBottom: 12,
          }}
        >
          Fan Clubs
        </h1>
        <p
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
            maxWidth: 440,
            margin: "0 auto",
          }}
        >
          Go deeper with your favorite artists. Exclusive content, direct
          access, and community — for real fans.
        </p>
      </section>

      <section
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "40px 24px 0",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
          gap: 14,
        }}
      >
        {performers.length === 0 ? (
          <div
            style={{
              gridColumn: "1/-1",
              padding: "40px 24px",
              textAlign: "center",
              color: "rgba(255,255,255,0.3)",
              fontSize: 14,
            }}
          >
            No fan clubs available yet. Check back soon.
          </div>
        ) : (
          performers.map((p) => {
            const accent = TIER_COLOR[p.tier] ?? "#FF2DAA";
            return (
              <div
                key={p.id}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${accent}22`,
                  borderRadius: 14,
                  padding: "22px 20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      background: `${accent}15`,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      flexShrink: 0,
                      overflow: "hidden",
                    }}
                  >
                    {p.profileImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.profileImageUrl}
                        alt={p.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "50%",
                        }}
                      />
                    ) : (
                      "🎤"
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: 8, color: accent, marginTop: 2 }}>
                      {p.category}
                    </div>
                  </div>
                  <div
                    style={{
                      marginLeft: "auto",
                      fontSize: 8,
                      fontWeight: 700,
                      color: accent,
                    }}
                  >
                    {p.tier}
                  </div>
                </div>

                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 5,
                  }}
                >
                  {[
                    "Exclusive feed access",
                    "Early ticket access",
                    "Supporter badge",
                    "Monthly shoutout",
                  ].map((perk) => (
                    <li
                      key={perk}
                      style={{
                        fontSize: 9,
                        color: "rgba(255,255,255,0.6)",
                        display: "flex",
                        gap: 7,
                      }}
                    >
                      <span style={{ color: accent, flexShrink: 0 }}>✓</span>
                      {perk}
                    </li>
                  ))}
                </ul>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>
                      From $2.99/mo
                    </div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>
                      3 tiers available
                    </div>
                  </div>
                  <Link
                    href={`/fan-club/${p.slug}`}
                    style={{
                      fontSize: 8,
                      fontWeight: 900,
                      letterSpacing: "0.08em",
                      color: "#050510",
                      background: accent,
                      borderRadius: 6,
                      padding: "8px 14px",
                      textDecoration: "none",
                    }}
                  >
                    JOIN
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </section>

      <section
        style={{
          maxWidth: 680,
          margin: "48px auto 0",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: "rgba(255,45,170,0.05)",
            border: "1px solid rgba(255,45,170,0.2)",
            borderRadius: 14,
            padding: "24px 22px",
          }}
        >
          <div
            style={{ fontSize: 12, fontWeight: 800, color: "#FF2DAA", marginBottom: 8 }}
          >
            Are you an artist?
          </div>
          <p
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.4)",
              marginBottom: 16,
            }}
          >
            Launch your own fan club and start earning recurring revenue from
            your most loyal fans.
          </p>
          <Link
            href="/hub/performer"
            style={{
              display: "inline-block",
              padding: "10px 24px",
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.12em",
              color: "#050510",
              background: "#FF2DAA",
              borderRadius: 7,
              textDecoration: "none",
            }}
          >
            LAUNCH YOUR FAN CLUB →
          </Link>
        </div>
      </section>
    </main>
  );
}
