"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTmiSession } from "@/hooks/SessionContext";
import { PERFORMER_REGISTRY } from "@/lib/performers/PerformerRegistry";
import ProfileShell from "@/components/profile/ProfileShell";
import { notFound } from "next/navigation";

interface PublicYophoPageProps {
  params: Promise<{ slug: string }>;
}

export default function PublicYophoPage({ params }: PublicYophoPageProps) {
  const [slug, setSlug] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    params.then((p) => {
      setSlug(p.slug);
      setResolved(true);
    });
  }, [params]);

  const { userId } = useTmiSession();
  const performer = slug
    ? PERFORMER_REGISTRY.find((p) => p.slug === slug)
    : undefined;

  if (!resolved || !slug) return null;
  if (!performer) return notFound();

  // Authorization: deny-by-default
  const isOwner =
    performer.ownerId != null &&
    userId != null &&
    performer.ownerId === userId;

  return (
    <ProfileShell
      role="performer"
      displayName={performer.name}
      slug={performer.slug}
      avatarUrl={performer.profileImageUrl}
      rank={performer.rank}
      tagline={performer.bio}
      articleRoute={`/performers/${slug}/article`}
    >
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Public Content — visible to everyone */}
        <PublicYophoContent performer={performer} />

        {/* Owner Control — only visible to account owner */}
        {isOwner && (
          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              border: "1px solid rgba(0, 255, 136, 0.3)",
              background: "rgba(0, 255, 136, 0.05)",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <Link
              href="/hub/performer"
              style={{
                display: "inline-block",
                padding: "10px 20px",
                background: "#00FF88",
                color: "#050510",
                fontWeight: "bold",
                borderRadius: "8px",
                textDecoration: "none",
                textTransform: "uppercase",
                fontSize: "12px",
                letterSpacing: "0.08em",
              }}
            >
              Manage My Page
            </Link>
          </div>
        )}
      </div>
    </ProfileShell>
  );
}

function PublicYophoContent({ performer }: { performer: any }) {
  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: `linear-gradient(160deg, rgba(0, 255, 136, 0.1), rgba(255, 45, 170, 0.1))`,
          padding: "24px",
          borderRadius: "12px",
          marginBottom: "24px",
          border: "1px solid rgba(0, 255, 255, 0.2)",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "900",
            color: "#ffffff",
            margin: 0,
            marginBottom: "8px",
          }}
        >
          {performer.name}
        </h1>
        <p
          style={{
            fontSize: "12px",
            color: "#aabbcc",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            margin: 0,
            marginBottom: "12px",
          }}
        >
          {performer.category} • {performer.tier} Tier
        </p>
        {performer.bio && (
          <p style={{ fontSize: "14px", color: "#ddeeff", margin: 0 }}>
            {performer.bio}
          </p>
        )}
      </section>

      {/* Stats */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <StatCard label="Fans" value={performer.fanCount.toLocaleString()} />
        <StatCard label="Likes" value={performer.likes.toLocaleString()} />
        <StatCard label="Rank" value={`#${performer.rank}`} />
        <StatCard label="XP" value={performer.xp.toLocaleString()} />
      </section>

      {/* Public Actions */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <ActionButton label="Follow" />
        <ActionButton label="Tip" />
        <ActionButton label="Book" />
        <ActionButton label="Sponsor" />
      </section>

      {/* Music / Catalog */}
      {performer.songs && performer.songs.length > 0 && (
        <section
          style={{
            marginBottom: "24px",
            border: "1px solid rgba(100, 200, 255, 0.2)",
            borderRadius: "12px",
            padding: "16px",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              color: "#00FFFF",
              margin: "0 0 12px 0",
              textTransform: "uppercase",
            }}
          >
            Music Catalog
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {performer.songs.map((song: any, idx: number) => (
              <div
                key={idx}
                style={{
                  padding: "8px 12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  color: "#ddeeff",
                }}
              >
                {song.title}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "rgba(0, 255, 255, 0.08)",
        border: "1px solid rgba(0, 255, 255, 0.2)",
        borderRadius: "8px",
        padding: "12px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          color: "#00FFFF",
          margin: "0 0 4px 0",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: "10px", color: "#aabbcc", textTransform: "uppercase" }}>
        {label}
      </div>
    </div>
  );
}

function ActionButton({ label }: { label: string }) {
  return (
    <button
      style={{
        padding: "10px 16px",
        background: "rgba(255, 45, 170, 0.2)",
        border: "1px solid #FF2DAA",
        color: "#FF2DAA",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "12px",
        textTransform: "uppercase",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "#FF2DAA";
        e.currentTarget.style.color = "#050510";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255, 45, 170, 0.2)";
        e.currentTarget.style.color = "#FF2DAA";
      }}
    >
      {label}
    </button>
  );
}
