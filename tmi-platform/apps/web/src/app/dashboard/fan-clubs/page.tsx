"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

interface FanClubStats {
  totalMembers: number;
  monthlyRevenue: number;
  postsThisMonth: number;
  churnRate: number | null;
}

interface FanClubMember {
  id: string;
  name: string;
  tier: string;
  since: string;
}

export default function FanClubDashboardPage() {
  const [stats, setStats] = useState<FanClubStats | null>(null);
  const [members, setMembers] = useState<FanClubMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [showPostForm, setShowPostForm] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postMsg, setPostMsg] = useState("");

  useEffect(() => {
    // Load fan club data from the API
    fetch("/api/fanclub/stats", { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setStats(data.stats ?? null);
          setMembers(data.members ?? []);
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  function submitPost() {
    if (!postContent.trim()) return;
    setPostMsg("Post published to fan club!");
    setPostContent("");
    setShowPostForm(false);
    setTimeout(() => setPostMsg(""), 3000);
  }

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
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link
            href="/hub/performer"
            style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
          >
            ← Performer Hub
          </Link>
        </div>
        <div
          style={{
            fontSize: 10,
            letterSpacing: 5,
            color: "#FF2DAA",
            fontWeight: 800,
            marginBottom: 4,
          }}
        >
          ARTIST DASHBOARD
        </div>
        <h1
          style={{
            fontSize: "clamp(22px,4vw,36px)",
            fontWeight: 900,
            margin: "0 0 28px",
          }}
        >
          Fan Club
        </h1>

        {/* Stats */}
        {loading ? (
          <div
            style={{
              color: "rgba(255,255,255,0.3)",
              fontSize: 13,
              marginBottom: 32,
            }}
          >
            Loading fan club data…
          </div>
        ) : stats ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
              gap: 12,
              marginBottom: 32,
            }}
          >
            {[
              {
                label: "Total Members",
                value: stats.totalMembers.toLocaleString(),
                sub: stats.totalMembers === 0 ? "No members yet" : "active",
              },
              {
                label: "Monthly Revenue",
                value: `$${(stats.monthlyRevenue / 100).toFixed(2)}`,
                sub: "after platform fee",
              },
              {
                label: "Posts This Month",
                value: stats.postsThisMonth.toString(),
                sub: stats.postsThisMonth === 0 ? "Post to engage fans" : "published",
              },
              {
                label: "Churn Rate",
                value: stats.churnRate != null ? `${stats.churnRate.toFixed(1)}%` : "—",
                sub: stats.churnRate != null ? "monthly" : "Not enough data yet",
              },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "rgba(255,45,170,0.04)",
                  border: "1px solid rgba(255,45,170,0.12)",
                  borderRadius: 12,
                  padding: "18px 20px",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.4)",
                    marginBottom: 4,
                  }}
                >
                  {s.label}
                </div>
                <div style={{ fontSize: 24, fontWeight: 900 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "#22c55e", marginTop: 2 }}>
                  {s.sub}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              background: "rgba(255,45,170,0.04)",
              border: "1px solid rgba(255,45,170,0.12)",
              borderRadius: 12,
              padding: "24px",
              marginBottom: 32,
              textAlign: "center",
              color: "rgba(255,255,255,0.4)",
              fontSize: 13,
            }}
          >
            Fan club stats not available. Set up your fan club to start collecting data.
          </div>
        )}

        {/* Members */}
        <div
          style={{
            fontSize: 10,
            letterSpacing: 4,
            color: "rgba(255,255,255,0.3)",
            fontWeight: 800,
            marginBottom: 12,
          }}
        >
          RECENT MEMBERS
        </div>

        <div style={{ display: "grid", gap: 8, marginBottom: 24 }}>
          {loading ? (
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
              Loading members…
            </div>
          ) : members.length === 0 ? (
            <div
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 10,
                padding: "16px 18px",
                color: "rgba(255,255,255,0.35)",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              No members yet. Share your fan club link to get your first supporters.
            </div>
          ) : (
            members.map((m) => (
              <div
                key={m.id}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 10,
                  padding: "14px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontWeight: 600, fontSize: 13 }}>{m.name}</span>
                <span style={{ fontSize: 11, color: "#FF2DAA" }}>{m.tier}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                  {m.since}
                </span>
              </div>
            ))
          )}
        </div>

        {postMsg && (
          <div
            style={{
              marginBottom: 14,
              padding: "10px 14px",
              background: "rgba(255,45,170,0.08)",
              border: "1px solid rgba(255,45,170,0.2)",
              borderRadius: 8,
              fontSize: 12,
              color: "#FF2DAA",
            }}
          >
            {postMsg}
          </div>
        )}

        {showPostForm && (
          <div
            style={{
              marginBottom: 16,
              background: "rgba(255,45,170,0.04)",
              border: "1px solid rgba(255,45,170,0.15)",
              borderRadius: 10,
              padding: "16px",
            }}
          >
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Write a post for your fan club..."
              rows={3}
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#fff",
                fontSize: 13,
                outline: "none",
                resize: "none",
                boxSizing: "border-box",
                marginBottom: 10,
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={submitPost}
                style={{
                  padding: "8px 18px",
                  borderRadius: 7,
                  background: "#FF2DAA",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 12,
                  cursor: "pointer",
                  border: "none",
                }}
              >
                Publish
              </button>
              <button
                onClick={() => setShowPostForm(false)}
                style={{
                  padding: "8px 18px",
                  borderRadius: 7,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={() => setShowPostForm(true)}
            style={{
              padding: "11px 22px",
              borderRadius: 8,
              background: "#FF2DAA",
              color: "#fff",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              border: "none",
            }}
          >
            + New Post
          </button>
          <Link
            href="/messages"
            style={{
              padding: "11px 22px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            Message All
          </Link>
        </div>
      </div>
    </main>
  );
}
