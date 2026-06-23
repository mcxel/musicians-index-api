import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Fan Club Feed · The Musician's Index" };

interface Props {
  params: Promise<{ artistSlug: string }>;
  searchParams: Promise<{ joined?: string }>;
}

export default async function FanClubFeedPage({ params, searchParams }: Props) {
  const { artistSlug } = await params;
  const { joined } = await searchParams;
  const displayName = artistSlug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#05060c",
        color: "#fff",
        padding: "32px 24px 80px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link
            href={`/fan-club/${artistSlug}`}
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              textDecoration: "none",
            }}
          >
            ← {displayName} Fan Club
          </Link>
        </div>

        {joined === "1" && (
          <div
            style={{
              background: "rgba(0,255,136,0.08)",
              border: "1px solid rgba(0,255,136,0.25)",
              borderRadius: 10,
              padding: "14px 18px",
              marginBottom: 24,
              fontSize: 13,
              color: "#00FF88",
              fontWeight: 700,
            }}
          >
            Welcome to the fan club! Exclusive posts will appear here as the
            artist publishes them.
          </div>
        )}

        <div
          style={{
            fontSize: 10,
            letterSpacing: 5,
            color: "#FF2DAA",
            fontWeight: 800,
            marginBottom: 4,
          }}
        >
          EXCLUSIVE FEED
        </div>
        <h1
          style={{
            fontSize: "clamp(22px,4vw,36px)",
            fontWeight: 900,
            margin: "0 0 28px",
          }}
        >
          {displayName}
        </h1>

        {/* Honest empty state — no fabricated posts */}
        <div
          style={{
            background: "rgba(255,45,170,0.03)",
            border: "1px solid rgba(255,45,170,0.12)",
            borderRadius: 12,
            padding: "40px 24px",
            textAlign: "center",
            color: "rgba(255,255,255,0.4)",
            fontSize: 13,
          }}
        >
          No posts yet. {displayName} will publish exclusive content here for
          fan club members.
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link
            href={`/fan-club/${artistSlug}/join`}
            style={{
              fontSize: 12,
              color: "#FF2DAA",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Upgrade Tier →
          </Link>
          <Link
            href={`/performers/${artistSlug}`}
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
              textDecoration: "none",
            }}
          >
            Artist Profile →
          </Link>
        </div>
      </div>
    </main>
  );
}
