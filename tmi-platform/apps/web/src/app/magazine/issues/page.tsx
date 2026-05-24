"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { MAGAZINE_ISSUE_1 } from "@/lib/magazine/magazineIssueData";

const CURRENT_ISSUE = {
  id: "1",
  title: "The Musician's Index — Issue 01",
  tagline: "The Crown Never Rests",
  coverTheme: "neon-editorial",
  month: "April 2026",
  articleCount: MAGAZINE_ISSUE_1.length,
  accent: "#FF2DAA",
  coverEmoji: "🎤",
  description:
    "Inside the platform that changed music. Artist spotlights, beat marketplace economics, cypher culture, and the Season 1 Grand Contest preview.",
};

const ARCHIVE_ISSUES = [
  {
    id: "archive-march-2026",
    title: "Issue 00 — Beta Edition",
    tagline: "Before the Crown",
    month: "March 2026",
    articleCount: 7,
    accent: "#00FFFF",
    coverEmoji: "🌐",
    description: "Platform launch preview, founding artist profiles, and the vision behind The Musician's Index.",
    isArchive: true,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  feature: "#FF2DAA",
  interview: "#00FFFF",
  editorial: "#FFD700",
  review: "#AA2DFF",
  news: "#00FF88",
};

export default function MagazineIssuesPage() {
  const featuredArticles = MAGAZINE_ISSUE_1.slice(0, 4);

  return (
    <div style={{ minHeight: "100vh", background: "#060410", color: "#fff", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 14, borderBottom: "1px solid #111" }}>
        <Link href="/magazine" style={{ color: "#AA2DFF", fontSize: 13, fontWeight: 900, letterSpacing: 4, textDecoration: "none" }}>
          TMI MAGAZINE
        </Link>
        <span style={{ color: "#333", fontSize: 11, letterSpacing: 1 }}>/</span>
        <span style={{ color: "#fff", fontSize: 11, letterSpacing: 2 }}>ALL ISSUES</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <Link href="/magazine/archive" style={{ color: "#333", fontSize: 11, letterSpacing: 2, textDecoration: "none" }}>ARCHIVE</Link>
          <Link href="/magazine" style={{ color: "#333", fontSize: 11, letterSpacing: 2, textDecoration: "none" }}>FRONT PAGE</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 20px 0" }}>
        {/* Page title */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: 40 }}>
          <div style={{ color: "#333", fontSize: 10, letterSpacing: 4, marginBottom: 6 }}>THE MUSICIAN&apos;S INDEX · DIGITAL EDITION</div>
          <h1 style={{ fontSize: "clamp(24px,4vw,40px)", fontWeight: 900, letterSpacing: 3, margin: 0, lineHeight: 1.1 }}>ISSUES</h1>
          <div style={{ width: 40, height: 2, marginTop: 10, background: "linear-gradient(90deg, #FF2DAA, #AA2DFF)" }} />
        </motion.div>

        {/* Current issue — featured card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }} style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "#00FF88", fontWeight: 800, marginBottom: 12 }}>CURRENT ISSUE</div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: 32,
            background: `linear-gradient(135deg, ${CURRENT_ISSUE.accent}10 0%, rgba(6,4,16,0.98) 65%)`,
            border: `1px solid ${CURRENT_ISSUE.accent}30`,
            borderRadius: 16,
            overflow: "hidden",
          }}>
            {/* Cover */}
            <div style={{
              background: `linear-gradient(160deg, ${CURRENT_ISSUE.accent}25 0%, rgba(6,4,16,0.95) 100%)`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: 32, gap: 12, borderRight: `1px solid ${CURRENT_ISSUE.accent}20`,
              minHeight: 280,
            }}>
              <div style={{ fontSize: 72 }}>{CURRENT_ISSUE.coverEmoji}</div>
              <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.3em", color: CURRENT_ISSUE.accent, textAlign: "center" }}>
                {CURRENT_ISSUE.month}
              </div>
              <div style={{
                padding: "3px 10px", borderRadius: 4,
                background: `${CURRENT_ISSUE.accent}15`,
                border: `1px solid ${CURRENT_ISSUE.accent}40`,
                color: CURRENT_ISSUE.accent, fontSize: 9, letterSpacing: 2, fontWeight: 800,
              }}>
                ISSUE 01
              </div>
            </div>

            {/* Info */}
            <div style={{ padding: "32px 28px 28px" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.2em", color: CURRENT_ISSUE.accent, fontWeight: 800, marginBottom: 10 }}>
                {CURRENT_ISSUE.coverTheme.toUpperCase()}
              </div>
              <h2 style={{ fontSize: "clamp(16px,2.5vw,24px)", fontWeight: 900, margin: "0 0 8px", lineHeight: 1.2 }}>
                {CURRENT_ISSUE.title}
              </h2>
              <div style={{ fontSize: 13, fontStyle: "italic", color: CURRENT_ISSUE.accent, marginBottom: 14, letterSpacing: 1 }}>
                &ldquo;{CURRENT_ISSUE.tagline}&rdquo;
              </div>
              <p style={{ fontSize: 13, color: "#666", lineHeight: 1.7, margin: "0 0 20px", maxWidth: 480 }}>
                {CURRENT_ISSUE.description}
              </p>

              {/* Article previews */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 22 }}>
                {featuredArticles.map((a) => (
                  <span key={a.slug} style={{
                    fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                    background: `${CATEGORY_COLORS[a.category] ?? "#00FFFF"}12`,
                    border: `1px solid ${CATEGORY_COLORS[a.category] ?? "#00FFFF"}30`,
                    color: CATEGORY_COLORS[a.category] ?? "#00FFFF",
                    letterSpacing: 1,
                  }}>
                    {a.title.length > 30 ? a.title.slice(0, 30) + "…" : a.title}
                  </span>
                ))}
                <span style={{ fontSize: 9, color: "#444", padding: "2px 6px" }}>
                  +{CURRENT_ISSUE.articleCount - 4} more
                </span>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <Link
                  href="/magazine/issue/1"
                  style={{
                    padding: "10px 24px",
                    background: `linear-gradient(135deg, ${CURRENT_ISSUE.accent}, #AA2DFF)`,
                    borderRadius: 6, color: "#fff",
                    fontSize: 11, letterSpacing: 2, fontWeight: 800, textDecoration: "none",
                  }}
                >
                  READ ISSUE 01 →
                </Link>
                <span style={{ fontSize: 10, color: "#333" }}>
                  {CURRENT_ISSUE.articleCount} articles · {CURRENT_ISSUE.month}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Articles in this issue */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "#FF2DAA", fontWeight: 800, marginBottom: 18 }}>
            INSIDE ISSUE 01 · {MAGAZINE_ISSUE_1.length} ARTICLES
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
            {MAGAZINE_ISSUE_1.map((article, i) => {
              const accent = CATEGORY_COLORS[article.category] ?? "#00FFFF";
              return (
                <motion.div
                  key={article.slug}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.04 }}
                >
                  <Link href={`/magazine/article/${article.slug}`} style={{ textDecoration: "none", display: "block" }}>
                    <div style={{
                      background: `${accent}08`,
                      border: `1px solid ${accent}20`,
                      borderRadius: 10,
                      padding: "16px 18px",
                      cursor: "pointer",
                      transition: "border-color 0.2s",
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 22, lineHeight: 1 }}>{article.icon}</span>
                        <div>
                          <div style={{ fontSize: 8, letterSpacing: 2, color: accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>
                            {article.category}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>
                            {article.title}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: 10, color: "#555", lineHeight: 1.5 }}>
                        {article.subtitle.length > 70 ? article.subtitle.slice(0, 70) + "…" : article.subtitle}
                      </div>
                      <div style={{ marginTop: 8, fontSize: 9, color: "#333" }}>
                        {article.author} · {new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Archive section */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "#00FFFF", fontWeight: 800, marginBottom: 18 }}>ARCHIVE</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {ARCHIVE_ISSUES.map((issue) => (
              <div key={issue.id} style={{
                background: `${issue.accent}06`,
                border: `1px solid ${issue.accent}18`,
                borderRadius: 12,
                padding: "20px 22px",
                opacity: 0.7,
              }}>
                <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 36 }}>{issue.coverEmoji}</div>
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: 2, color: issue.accent, fontWeight: 700, marginBottom: 6 }}>
                      {issue.month} · {issue.articleCount} articles
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 4 }}>{issue.title}</div>
                    <div style={{ fontSize: 11, color: "#555", marginBottom: 14 }}>{issue.description}</div>
                    <Link
                      href="/magazine/archive"
                      style={{
                        fontSize: 10, color: issue.accent, letterSpacing: 2,
                        textDecoration: "none", fontWeight: 700,
                        border: `1px solid ${issue.accent}30`,
                        padding: "4px 10px", borderRadius: 4,
                      }}
                    >
                      VIEW ARCHIVE →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer nav */}
        <div style={{ borderTop: "1px solid #111", paddingTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/magazine" style={{ fontSize: 10, color: "#444", letterSpacing: 2, textDecoration: "none" }}>← FRONT PAGE</Link>
          <Link href="/magazine/archive" style={{ fontSize: 10, color: "#444", letterSpacing: 2, textDecoration: "none" }}>FULL ARCHIVE</Link>
          <Link href="/magazine/issue/1" style={{ fontSize: 10, color: "#FF2DAA", letterSpacing: 2, textDecoration: "none", marginLeft: "auto" }}>READ ISSUE 01 →</Link>
        </div>
      </div>
    </div>
  );
}
