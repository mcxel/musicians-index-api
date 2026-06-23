import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Join Fan Club · The Musician's Index" };

const TIERS: Record<string, { label: string; price: string; amountCents: number; perks: string[] }> = {
  supporter: {
    label: "Supporter",
    price: "$2.99/mo",
    amountCents: 299,
    perks: ["Exclusive feed access", "Supporter badge", "Monthly shoutout"],
  },
  "ride-or-die": {
    label: "Ride or Die",
    price: "$7.99/mo",
    amountCents: 799,
    perks: ["All Supporter perks", "Backstage content", "Priority Q&A slots"],
  },
  "inner-circle": {
    label: "Inner Circle",
    price: "$19.99/mo",
    amountCents: 1999,
    perks: ["All tiers", "1-on-1 message/month", "Early show tickets"],
  },
};

const DEFAULT_TIER = "supporter";

interface Props {
  params: Promise<{ artistSlug: string }>;
  searchParams: Promise<{ tier?: string }>;
}

export default async function JoinFanClubPage({ params, searchParams }: Props) {
  const { artistSlug } = await params;
  const { tier: tierKey = DEFAULT_TIER } = await searchParams;
  const displayName = artistSlug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const tier = TIERS[tierKey] ?? TIERS[DEFAULT_TIER]!;
  const productName = encodeURIComponent(`${displayName} Fan Club — ${tier.label}`);
  const checkoutUrl = `/api/stripe/checkout?amount=${tier.amountCents}&productName=${productName}&mode=subscription&successPath=/fan-club/${artistSlug}/feed`;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#05060c",
        color: "#fff",
        padding: "32px 24px 80px",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        <div
          style={{
            fontSize: 10,
            letterSpacing: 5,
            color: "#FF2DAA",
            fontWeight: 800,
            marginBottom: 4,
          }}
        >
          FAN CLUB
        </div>
        <h1
          style={{
            fontSize: "clamp(20px,4vw,32px)",
            fontWeight: 900,
            margin: "0 0 10px",
          }}
        >
          Join {displayName}
        </h1>
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.45)",
            marginBottom: 32,
          }}
        >
          You&apos;ll be subscribed via Stripe. Cancel any time.
        </p>

        {/* Tier selector */}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          {Object.entries(TIERS).map(([key, t]) => (
            <Link
              key={key}
              href={`/fan-club/${artistSlug}/join?tier=${key}`}
              style={{
                padding: "7px 14px",
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 700,
                textDecoration: "none",
                background:
                  key === tierKey
                    ? "rgba(255,45,170,0.15)"
                    : "rgba(255,255,255,0.04)",
                border: `1px solid ${key === tierKey ? "rgba(255,45,170,0.5)" : "rgba(255,255,255,0.1)"}`,
                color: key === tierKey ? "#FF2DAA" : "rgba(255,255,255,0.5)",
              }}
            >
              {t.label}
            </Link>
          ))}
        </div>

        <div
          style={{
            background: "rgba(255,45,170,0.06)",
            border: "1px solid rgba(255,45,170,0.2)",
            borderRadius: 14,
            padding: "28px",
            marginBottom: 20,
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 4 }}>
            {tier.label}
          </div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 900,
              color: "#FF2DAA",
              marginBottom: 16,
            }}
          >
            {tier.price}
          </div>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 20px",
              display: "grid",
              gap: 7,
              textAlign: "left",
            }}
          >
            {tier.perks.map((perk) => (
              <li
                key={perk}
                style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}
              >
                ✓ {perk}
              </li>
            ))}
          </ul>
          <Link
            href={checkoutUrl}
            style={{
              display: "block",
              padding: "14px",
              borderRadius: 10,
              background: "#FF2DAA",
              color: "#fff",
              fontWeight: 800,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Subscribe — {tier.price}
          </Link>
        </div>

        <Link
          href={`/fan-club/${artistSlug}`}
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
            textDecoration: "none",
          }}
        >
          ← Back to Fan Club
        </Link>
      </div>
    </main>
  );
}
