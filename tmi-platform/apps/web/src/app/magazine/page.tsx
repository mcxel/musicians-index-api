"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { MAGAZINE_ISSUE_1, type MagazineArticle } from "@/lib/magazine/magazineIssueData";

const CATEGORY_COLORS: Record<string, string> = {
  feature:   "#FF2DAA",
  interview: "#00FFFF",
  editorial: "#FFD700",
  review:    "#AA2DFF",
  news:      "#00FF88",
};

const CLIP_PATHS = [
  "polygon(0 0, 100% 0, 100% 85%, 92% 100%, 0 100%)",
  "polygon(0 0, 95% 0, 100% 8%, 100% 100%, 5% 100%, 0 92%)",
  "polygon(8% 0, 100% 0, 100% 100%, 0 100%, 0 10%)",
  "polygon(0 0, 92% 0, 100% 12%, 100% 100%, 0 100%)",
  "polygon(0 8%, 100% 0, 100% 100%, 0 92%)",
  "polygon(5% 0, 100% 0, 95% 100%, 0 100%)",
];

const SPONSOR_SLOT = {
  label: "SPONSORED",
  title: "LIST YOUR BRAND ON TMI",
  body: "Reach 50,000+ music fans, artists, and producers. Advertiser packages start at $299/mo.",
  cta: "GET STARTED →",
  href: "/advertise",
  accent: "#FFD700",
};

function ArticleCard({ article, index, large = false }: { article: MagazineArticle; index: number; large?: boolean }) {
  const accent = CATEGORY_COLORS[article.category] ?? "#00FFFF";
  const clip = large ? "polygon(0 0, 100% 0, 100% 88%, 96% 100%, 0 100%)" : CLIP_PATHS[index % CLIP_PATHS.length];
  const firstPara = article.blocks.find(b => b.type === "paragraph")?.text ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      whileHover={{ scale: 1.02, y: -4 }}
      style={{ position: "relative" }}
    >
      <Link href={`/magazine/article/${article.slug}`} style={{ textDecoration: "none", display: "block" }}>
        <div style={{
          clipPath: clip,
          background: `linear-gradient(135deg, ${accent}18 0%, rgba(6,4,16,0.97) 65%)`,
          border: `1px solid ${accent}40`,
          padding: large ? "36px 32px 40px" : "24px 20px 28px",
          position: "relative",
          overflow: "hidden",
          minHeight: large ? 260 : 180,
          cursor: "pointer",
        }}>
          {/* Glow dot */}
          <div style={{
            position: "absolute", top: 14, right: 14, width: 8, height: 8,
            borderRadius: "50%", background: accent,
            boxShadow: `0 0 14px ${accent}`,
          }} />

          <div style={{ fontSize: large ? 34 : 26, marginBottom: 10 }}>{article.icon}</div>

          <div style={{
            color: accent, fontSize: 10, fontWeight: 700, letterSpacing: 3,
            marginBottom: 8, textTransform: "uppercase",
          }}>
            {article.category} · {new Date(article.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </div>

          <h2 style={{
            color: "#fff",
            fontSize: large ? "clamp(18px, 3vw, 26px)" : "clamp(13px, 2vw, 16px)",
            fontWeight: 900,
            letterSpacing: large ? 2 : 1,
            margin: "0 0 10px",
            lineHeight: 1.25,
          }}>
            {article.title}
          </h2>

          {large && (
            <p style={{ color: "#777", fontSize: 13, lineHeight: 1.65, margin: "0 0 12px" }}>
              {article.subtitle}
            </p>
          )}

          {!large && firstPara && (
            <p style={{ color: "#666", fontSize: 12, lineHeight: 1.6, margin: 0 }}>
              {firstPara.length > 100 ? firstPara.slice(0, 100) + "…" : firstPara}
            </p>
          )}

          <div style={{ color: "#444", fontSize: 10, marginTop: 10, letterSpacing: 1 }}>
            {article.author}
          </div>

          {/* Bottom accent bar */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          }} />
        </div>
      </Link>
    </motion.div>
  );
}

function SponsorCard({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
    >
      <Link href={SPONSOR_SLOT.href} style={{ textDecoration: "none", display: "block" }}>
        <div style={{
          clipPath: "polygon(0 0, 92% 0, 100% 12%, 100% 100%, 0 100%)",
          background: `linear-gradient(135deg, ${SPONSOR_SLOT.accent}12 0%, rgba(6,4,16,0.97) 65%)`,
          border: `1px dashed ${SPONSOR_SLOT.accent}50`,
          padding: "24px 20px 28px",
          position: "relative",
          overflow: "hidden",
          minHeight: 180,
          cursor: "pointer",
        }}>
          <div style={{
            fontSize: 9, color: SPONSOR_SLOT.accent, letterSpacing: 3,
            fontWeight: 700, marginBottom: 10,
          }}>
            {SPONSOR_SLOT.label}
          </div>
          <div style={{ color: "#fff", fontSize: 15, fontWeight: 900, letterSpacing: 1, marginBottom: 10 }}>
            {SPONSOR_SLOT.title}
          </div>
          <p style={{ color: "#666", fontSize: 12, lineHeight: 1.6, margin: "0 0 14px" }}>
            {SPONSOR_SLOT.body}
          </p>
          <div style={{
            display: "inline-block", padding: "6px 14px",
            background: `${SPONSOR_SLOT.accent}22`,
            border: `1px solid ${SPONSOR_SLOT.accent}60`,
            borderRadius: 4, color: SPONSOR_SLOT.accent,
            fontSize: 10, letterSpacing: 2, fontWeight: 700,
          }}>
            {SPONSOR_SLOT.cta}
          </div>
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg, transparent, ${SPONSOR_SLOT.accent}, transparent)`,
          }} />
        </div>
      </Link>
    </motion.div>
  );
}

export default function MagazinePage() {
  const [hero, ...rest] = MAGAZINE_ISSUE_1;
  // Inject sponsor slot after index 4
  const gridItems: Array<MagazineArticle | "sponsor"> = [
    ...rest.slice(0, 4),
    "sponsor",
    ...rest.slice(4),
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#060410", paddingBottom: 80 }}>
      {/* Header */}
      <div style={{
        padding: "14px 20px",
        display: "flex", alignItems: "center", gap: 14,
        borderBottom: "1px solid #111",
      }}>
        <span style={{ color: "#AA2DFF", fontSize: 13, fontWeight: 900, letterSpacing: 4 }}>
          TMI MAGAZINE
        </span>
        <span style={{
          padding: "3px 10px", borderRadius: 4,
          background: "rgba(255,45,170,0.15)",
          border: "1px solid rgba(255,45,170,0.3)",
          color: "#FF2DAA", fontSize: 10, letterSpacing: 2,
        }}>
          ISSUE 01
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <Link href="/magazine/archive" style={{ color: "#333", fontSize: 11, letterSpacing: 2, textDecoration: "none" }}>ARCHIVE</Link>
          <Link href="/magazine/auto" style={{ color: "#333", fontSize: 11, letterSpacing: 2, textDecoration: "none" }}>AUTO-GEN</Link>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 20px 0" }}>
        {/* Masthead */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ marginBottom: 32 }}
        >
          <div style={{ color: "#333", fontSize: 10, letterSpacing: 4, marginBottom: 6 }}>
            THE MUSICIAN&apos;S INDEX · DIGITAL EDITION
          </div>
          <h1 style={{
            fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900,
            letterSpacing: 3, color: "#fff", margin: 0, lineHeight: 1.1,
          }}>
            THE FRONT PAGE
          </h1>
          <div style={{
            width: 60, height: 2, marginTop: 12,
            background: "linear-gradient(90deg, #FF2DAA, #AA2DFF)",
          }} />
        </motion.div>

        {/* Hero article */}
        {hero && <ArticleCard article={hero} index={0} large />}

        {/* Bento grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 18,
          marginTop: 18,
        }}>
          {gridItems.map((item, i) =>
            item === "sponsor"
              ? <SponsorCard key="sponsor" delay={(i + 1) * 0.07} />
              : <ArticleCard key={item.slug} article={item} index={i + 1} />
          )}
        </div>

        {/* Category filter strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ marginTop: 40, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}
        >
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
            <span key={cat} style={{
              padding: "5px 14px", borderRadius: 4,
              background: `${color}15`,
              border: `1px solid ${color}40`,
              color, fontSize: 10, letterSpacing: 2, fontWeight: 700,
              textTransform: "uppercase",
            }}>
              {cat}
            </span>
          ))}
        </motion.div>

        {/* Footer links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{ marginTop: 40, textAlign: "center", borderTop: "1px solid #111", paddingTop: 32 }}
        >
          <div style={{ color: "#222", fontSize: 10, letterSpacing: 4, marginBottom: 16 }}>
            EXPLORE MORE
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/magazine/issues/current" style={{
              padding: "9px 22px",
              background: "linear-gradient(135deg, #FF2DAA, #AA2DFF)",
              borderRadius: 6, color: "#fff",
              fontSize: 11, letterSpacing: 2, fontWeight: 700, textDecoration: "none",
            }}>
              FULL ISSUE →
            </Link>
            <Link href="/magazine/archive" style={{
              padding: "9px 22px", background: "transparent",
              border: "1px solid #222", borderRadius: 6, color: "#444",
              fontSize: 11, letterSpacing: 2, textDecoration: "none",
            }}>
              ARCHIVE
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
