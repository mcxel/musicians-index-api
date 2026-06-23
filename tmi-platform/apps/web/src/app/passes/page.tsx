import Link from "next/link";
import type { Metadata } from "next";
import { SEASON_ONE_REWARDS, SEASON_ONE_META } from "@/config/seasonOneRewards";

export const metadata: Metadata = {
  title: "Season Pass | TMI",
  description:
    "Buy a Season Pass for The Musician's Index. Get exclusive rewards, XP boosts, and access to a full season of live events.",
};

const PASS_OPTIONS = [
  {
    id: "fan",
    label: "Fan Season Pass",
    price: "$9.99",
    amountCents: 999,
    interval: "Season",
    color: "#00FFFF",
    description:
      "Full season of fan rewards: avatar cosmetics, emotes, action icons, and companion bots.",
    perks: [
      "All Fan track rewards unlocked as you earn XP",
      "Season 1 exclusive avatar items",
      "Priority seating in live rooms",
      "Season Pass badge on profile",
    ],
    track: "fan" as const,
  },
  {
    id: "artist",
    label: "Artist Season Pass",
    price: "$19.99",
    amountCents: 1999,
    interval: "Season",
    color: "#FF2DAA",
    description:
      "Full season of artist rewards: billboard promos, bandwidth keys, magazine features.",
    perks: [
      "All Artist track rewards unlocked as you earn XP",
      "HD WebRTC bandwidth upgrade keys",
      "Live World billboard promo slots",
      "Monthly Magazine feature eligibility",
    ],
    track: "artist" as const,
  },
  {
    id: "bundle",
    label: "Full Bundle",
    price: "$24.99",
    amountCents: 2499,
    interval: "Season",
    color: "#FFD700",
    description:
      "Every reward on both tracks. Maximum visibility, maximum rewards.",
    perks: [
      "All Fan + Artist track rewards",
      "Exclusive Bundle badge",
      "Priority support channel",
      "Early access to Season 2",
    ],
    track: "fan" as const,
  },
];

export default function SeasonPassPage() {
  const fanRewards = SEASON_ONE_REWARDS.filter((r) => r.track === "fan");
  const artistRewards = SEASON_ONE_REWARDS.filter((r) => r.track === "artist");

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 60% 10%, rgba(170,45,255,0.12), transparent 55%), #050510",
        color: "#fff",
        paddingBottom: 80,
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Hero */}
      <section
        style={{
          textAlign: "center",
          padding: "56px 24px 40px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontSize: 36,
            marginBottom: 14,
          }}
        >
          {SEASON_ONE_META.instrumentEmoji}
        </div>
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.4em",
            color: SEASON_ONE_META.primaryColor,
            fontWeight: 800,
            marginBottom: 8,
          }}
        >
          SEASON {SEASON_ONE_META.seasonNumber} · {SEASON_ONE_META.seasonName.toUpperCase()}
        </div>
        <h1
          style={{
            fontSize: "clamp(1.8rem,5vw,3.2rem)",
            fontWeight: 900,
            margin: "0 0 12px",
            letterSpacing: "-0.02em",
          }}
        >
          Season Pass
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.5)",
            maxWidth: 480,
            margin: "0 auto 8px",
            lineHeight: 1.6,
          }}
        >
          One pass, a full year of rewards. Earn XP through the season and
          unlock exclusive items at every tier.
        </p>
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.3)",
            marginTop: 6,
          }}
        >
          Season runs {SEASON_ONE_META.startDate} — {SEASON_ONE_META.endDate}
        </div>
      </section>

      {/* Pass options */}
      <section
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "48px 24px 0",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
          gap: 16,
        }}
      >
        {PASS_OPTIONS.map((pass) => (
          <div
            key={pass.id}
            style={{
              background: `${pass.color}08`,
              border: `1px solid ${pass.color}28`,
              borderRadius: 16,
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: "0.2em",
                color: pass.color,
                fontWeight: 800,
                marginBottom: 6,
              }}
            >
              {pass.interval.toUpperCase()}
            </div>
            <div
              style={{ fontSize: 16, fontWeight: 900, marginBottom: 4 }}
            >
              {pass.label}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: pass.color,
                marginBottom: 12,
              }}
            >
              {pass.price}
            </div>
            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.5)",
                marginBottom: 16,
                lineHeight: 1.6,
              }}
            >
              {pass.description}
            </p>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "0 0 24px",
                display: "flex",
                flexDirection: "column",
                gap: 7,
              }}
            >
              {pass.perks.map((perk) => (
                <li
                  key={perk}
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.65)",
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ color: pass.color, flexShrink: 0, marginTop: 1 }}>
                    ✓
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
            <Link
              href={`/api/stripe/checkout?amount=${pass.amountCents}&productName=${encodeURIComponent(pass.label)}&mode=payment`}
              style={{
                display: "block",
                textAlign: "center",
                padding: "13px",
                borderRadius: 10,
                background: pass.color,
                color: "#050510",
                fontWeight: 900,
                fontSize: 13,
                textDecoration: "none",
                letterSpacing: "0.06em",
                marginTop: "auto",
              }}
            >
              GET PASS →
            </Link>
          </div>
        ))}
      </section>

      {/* Reward tracks */}
      <section
        style={{
          maxWidth: 1000,
          margin: "56px auto 0",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.3em",
            color: "rgba(255,255,255,0.4)",
            fontWeight: 800,
            marginBottom: 24,
          }}
        >
          SEASON REWARDS — WHAT YOU UNLOCK
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          {/* Fan track */}
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "#00FFFF",
                marginBottom: 14,
              }}
            >
              Fan Track
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {fanRewards.map((r) => (
                <div
                  key={r.id}
                  style={{
                    background: "rgba(0,255,255,0.04)",
                    border: "1px solid rgba(0,255,255,0.14)",
                    borderRadius: 10,
                    padding: "14px 16px",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{r.icon}</span>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        marginBottom: 2,
                      }}
                    >
                      {r.title}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.45)",
                        lineHeight: 1.5,
                      }}
                    >
                      {r.description}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: "#00FFFF",
                        fontWeight: 700,
                        marginTop: 4,
                      }}
                    >
                      Tier {r.tier} · {r.xpRequired.toLocaleString()} XP
                      {r.isLimited ? " · Limited" : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Artist track */}
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "#FF2DAA",
                marginBottom: 14,
              }}
            >
              Artist Track
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {artistRewards.map((r) => (
                <div
                  key={r.id}
                  style={{
                    background: "rgba(255,45,170,0.04)",
                    border: "1px solid rgba(255,45,170,0.14)",
                    borderRadius: 10,
                    padding: "14px 16px",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{r.icon}</span>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        marginBottom: 2,
                      }}
                    >
                      {r.title}
                    </div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.45)",
                        lineHeight: 1.5,
                      }}
                    >
                      {r.description}
                    </div>
                    <div
                      style={{
                        fontSize: 9,
                        color: "#FF2DAA",
                        fontWeight: 700,
                        marginTop: 4,
                      }}
                    >
                      Tier {r.tier} · {r.xpRequired.toLocaleString()} XP
                      {r.isLimited ? " · Limited" : ""}
                      {r.promotionCredits
                        ? ` · ${r.promotionCredits} promo credits`
                        : ""}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section
        style={{
          maxWidth: 600,
          margin: "56px auto 0",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: "rgba(170,45,255,0.07)",
            border: "1px solid rgba(170,45,255,0.2)",
            borderRadius: 14,
            padding: "28px 24px",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: SEASON_ONE_META.primaryColor,
              marginBottom: 8,
            }}
          >
            Already have XP on the platform?
          </div>
          <p
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.45)",
              marginBottom: 20,
              lineHeight: 1.7,
            }}
          >
            Your XP keeps accumulating whether or not you have a Season Pass.
            Buy a pass at any time to unlock the rewards you&apos;ve already
            earned.
          </p>
          <Link
            href="/xp"
            style={{
              display: "inline-block",
              padding: "10px 24px",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.12em",
              color: "#050510",
              background: SEASON_ONE_META.primaryColor,
              borderRadius: 8,
              textDecoration: "none",
            }}
          >
            VIEW MY XP →
          </Link>
        </div>
      </section>
    </main>
  );
}
