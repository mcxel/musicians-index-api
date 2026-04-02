"use client";
import { motion } from "framer-motion";
import Link from "next/link";

const STUB_ARTICLES = [
  { title: "Rising to the Crown: The Story Behind the Sound", category: "FEATURE", date: "Mar 2026", slug: null, color: "#FF2DAA" },
  { title: "Inside the Studio: Production Methods Revealed", category: "INTERVIEW", date: "Feb 2026", slug: null, color: "#00FFFF" },
  { title: "TMI Artist Spotlight: Breaking the Underground", category: "SPOTLIGHT", date: "Jan 2026", slug: null, color: "#AA2DFF" },
];

export default function ArtistArticles() {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 10, padding: "20px 24px", marginBottom: 20,
    }}>
      <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>
        PRESS & FEATURES
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {STUB_ARTICLES.map((a, i) => (
          <motion.div
            key={a.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ x: 4 }}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "12px 14px", borderRadius: 8,
              background: "rgba(255,255,255,0.025)",
              border: `1px solid ${a.color}14`,
              cursor: "pointer",
            }}
          >
            <div style={{
              fontSize: 8, fontWeight: 800, letterSpacing: "0.15em", color: a.color,
              border: `1px solid ${a.color}40`, borderRadius: 4, padding: "3px 8px",
              flexShrink: 0, whiteSpace: "nowrap",
            }}>{a.category}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {a.slug ? <Link href={`/articles/${a.slug}`} style={{ color: "inherit", textDecoration: "none" }}>{a.title}</Link> : a.title}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{a.date}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
