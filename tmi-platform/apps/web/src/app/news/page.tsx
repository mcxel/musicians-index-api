import Link from "next/link";
import { MAGAZINE_ISSUE_1 } from "@/lib/magazine/magazineIssueData";

export const metadata = { title: "News & Updates | TMI" };

const ACCENT: Record<string, string> = {
  news: "#00FF88",
  feature: "#FF2DAA",
  editorial: "#FFD700",
  interview: "#00FFFF",
  review: "#AA2DFF",
};

const CATEGORY_ICON: Record<string, string> = {
  news: "📰",
  feature: "⭐",
  editorial: "✍️",
  interview: "🎙️",
  review: "🎧",
};

export default function NewsPage() {
  const articles = MAGAZINE_ISSUE_1.filter((a) =>
    ["news", "feature", "editorial"].includes(a.category)
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #04061a 0%, #060314 55%, #030610 100%)",
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Top bar */}
      <nav
        style={{
          position: "sticky", top: 0, zIndex: 40,
          background: "rgba(4,6,20,0.88)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(0,255,136,0.12)",
          padding: "10px 24px",
          display: "flex", alignItems: "center", gap: 14,
        }}
      >
        <Link
          href="/home/1"
          style={{
            width: 30, height: 30, borderRadius: 8,
            background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            textDecoration: "none", color: "rgba(0,255,136,0.7)", fontSize: 14,
          }}
          title="Home"
        >⌂</Link>
        <span style={{ width: 1, height: 16, background: "rgba(255,255,255,0.1)" }} />
        <span
          style={{
            fontSize: 9, fontWeight: 800, letterSpacing: "0.22em",
            color: "#00FF88", textTransform: "uppercase",
          }}
        >
          TMI News & Updates
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <Link
            href="/magazine"
            style={{
              fontSize: 9, fontWeight: 700, color: "rgba(0,255,255,0.6)",
              textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase",
            }}
          >
            Full Magazine →
          </Link>
          <Link
            href="/articles"
            style={{
              fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.35)",
              textDecoration: "none", letterSpacing: "0.1em", textTransform: "uppercase",
            }}
          >
            All Articles →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div
        style={{
          padding: "60px 24px 40px",
          maxWidth: 900, margin: "0 auto",
          position: "relative",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
            width: 600, height: 200, pointerEvents: "none",
            background: "radial-gradient(ellipse at 50% 0%, rgba(0,255,136,0.08) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            fontSize: 9, color: "#00FF88", fontWeight: 800,
            letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: 12,
          }}
        >
          The Musician&apos;s Index
        </div>
        <h1
          style={{
            fontSize: "clamp(28px, 6vw, 48px)", fontWeight: 900, margin: "0 0 12px",
            letterSpacing: "-0.01em", lineHeight: 1.1,
            background: "linear-gradient(135deg, #fff 30%, rgba(0,255,136,0.8) 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}
        >
          News & Updates
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0, maxWidth: 480 }}>
          Platform updates, artist features, editorial stories, and live event coverage.
        </p>
      </div>

      {/* Article grid */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 80px" }}>
        {articles.length === 0 ? (
          <div
            style={{
              textAlign: "center", padding: "80px 0",
              color: "rgba(255,255,255,0.25)", fontSize: 14,
            }}
          >
            No news articles yet. Check back soon.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {articles.map((a, idx) => {
              const accent = ACCENT[a.category] ?? "#00FFFF";
              const icon = CATEGORY_ICON[a.category] ?? "📄";
              return (
                <Link
                  key={a.slug}
                  href={`/magazine/article/${a.slug}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      display: "flex", gap: 18, padding: "20px 20px",
                      background: idx === 0
                        ? `linear-gradient(135deg, ${accent}12, ${accent}06)`
                        : `${accent}08`,
                      border: `1px solid ${accent}${idx === 0 ? "35" : "20"}`,
                      borderRadius: 12,
                      transition: "all 0.18s ease",
                      cursor: "pointer",
                      position: "relative", overflow: "hidden",
                    }}
                  >
                    {idx === 0 && (
                      <div
                        aria-hidden="true"
                        style={{
                          position: "absolute", top: 0, right: 0,
                          fontSize: 9, fontWeight: 800, letterSpacing: "0.14em",
                          color: accent, background: `${accent}18`,
                          padding: "3px 10px 3px 10px",
                          borderBottomLeftRadius: 8,
                          border: `1px solid ${accent}30`,
                        }}
                      >
                        LATEST
                      </div>
                    )}

                    {/* Icon */}
                    <div
                      style={{
                        fontSize: 28, flexShrink: 0,
                        width: 48, height: 48,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: `${accent}10`, borderRadius: 10,
                        border: `1px solid ${accent}20`,
                      }}
                    >
                      {a.icon ?? icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex", gap: 8, alignItems: "center", marginBottom: 7, flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            color: accent, fontSize: 8, fontWeight: 800,
                            letterSpacing: "0.2em", textTransform: "uppercase",
                            background: `${accent}12`,
                            border: `1px solid ${accent}30`,
                            padding: "1px 6px", borderRadius: 4,
                          }}
                        >
                          {a.category}
                        </span>
                        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 9 }}>
                          {new Date(a.publishedAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </span>
                      </div>
                      <h2
                        style={{
                          color: "#fff", fontSize: "clamp(14px, 2.5vw, 18px)",
                          fontWeight: 800, margin: "0 0 6px", lineHeight: 1.3,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {a.title}
                      </h2>
                      <p
                        style={{
                          color: "rgba(255,255,255,0.45)", fontSize: 12,
                          margin: "0 0 8px", lineHeight: 1.6,
                        }}
                      >
                        {a.subtitle}
                      </p>
                      <div
                        style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}
                      >
                        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10 }}>
                          {a.author}
                        </span>
                        <span
                          style={{
                            fontSize: 9, color: accent, fontWeight: 700,
                            letterSpacing: "0.08em",
                          }}
                        >
                          Read →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Footer nav */}
        <div
          style={{
            marginTop: 48, paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex", gap: 20, flexWrap: "wrap",
          }}
        >
          <Link
            href="/magazine"
            style={{
              fontSize: 10, color: "#00FFFF",
              letterSpacing: "0.12em", textDecoration: "none",
              textTransform: "uppercase", fontWeight: 700,
            }}
          >
            ← Full Magazine
          </Link>
          <Link
            href="/articles"
            style={{
              fontSize: 10, color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.12em", textDecoration: "none",
              textTransform: "uppercase", fontWeight: 700,
            }}
          >
            All Articles
          </Link>
          <Link
            href="/home/1"
            style={{
              fontSize: 10, color: "rgba(0,255,136,0.5)",
              letterSpacing: "0.12em", textDecoration: "none",
              textTransform: "uppercase", fontWeight: 700,
              marginLeft: "auto",
            }}
          >
            ⌂ Home
          </Link>
        </div>
      </div>
    </main>
  );
}
