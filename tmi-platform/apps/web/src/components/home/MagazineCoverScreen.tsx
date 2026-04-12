"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import SectionTitle from "@/components/ui/SectionTitle";
import { getHomeEditorial, type HomeEditorialArticle } from "@/components/home/data/getHomeEditorial";

const CAT_COLORS: Record<string, string> = {
  FEATURE: "#FF2DAA", EXCLUSIVE: "#FFD700", SPOTLIGHT: "#00FFFF", INDUSTRY: "#AA2DFF",
};

export default function MagazineCoverScreen() {
  const [articles, setArticles] = useState<HomeEditorialArticle[]>([]);
  const [source, setSource] = useState<"live" | "fallback">("fallback");

  useEffect(() => {
    getHomeEditorial()
      .then((result) => {
        setArticles(result.data.cover);
        setSource(result.source);
      })
      .catch(() => {});
  }, []);

  return (
    <div style={{ minHeight: "calc(100vh - 52px)", background: "linear-gradient(160deg, #050510 0%, #0A050F 40%, #050510 100%)" }}>

      {/* ── COVER HERO ── */}
      <div style={{
        position: "relative", overflow: "hidden",
        height: "clamp(360px, 55vh, 600px)",
        display: "flex", alignItems: "flex-end",
        background: "linear-gradient(135deg, #0D0020 0%, #1A0030 50%, #0D0015 100%)",
        borderBottom: "1px solid rgba(255,45,170,0.2)",
      }}>
        {/* Background glow */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 60% 80% at 70% 50%, rgba(255,45,170,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Animated neon lines */}
        {[0.2, 0.5, 0.8].map((y, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.03, 0.12, 0.03], x: [0, 30, 0] }}
            transition={{ duration: 8 + i * 2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute", top: `${y * 100}%`, left: 0, right: 0,
              height: 1, background: "linear-gradient(90deg, transparent 0%, #FF2DAA 50%, transparent 100%)",
            }}
          />
        ))}

        {/* Avatar / cover art placeholder */}
        <div style={{
          position: "absolute", right: "8%", bottom: 0, width: "min(320px, 40%)",
          height: "95%",
          background: "linear-gradient(180deg, rgba(255,45,170,0.08) 0%, rgba(170,45,255,0.15) 60%, transparent 100%)",
          borderRadius: "12px 12px 0 0",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: "70%", aspectRatio: "1",
            borderRadius: "50%",
            border: "2px solid rgba(255,45,170,0.3)",
            background: "radial-gradient(circle, rgba(255,45,170,0.15) 0%, transparent 70%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 64, filter: "drop-shadow(0 0 20px #FF2DAA)" }}>🎤</span>
          </div>
        </div>

        {/* Cover text */}
        <div style={{ position: "relative", zIndex: 2, padding: "0 32px 32px", maxWidth: "55%" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div style={{
              fontSize: 9, fontWeight: 900, letterSpacing: "0.3em",
              color: "#FF2DAA", textShadow: "0 0 20px rgba(255,45,170,0.8)",
              marginBottom: 8,
            }}>
              THE MUSICIAN&apos;S INDEX · ISSUE #12 · APRIL 2026
            </div>
            <h1 style={{
              fontSize: "clamp(28px, 4vw, 56px)",
              fontWeight: 900, lineHeight: 1.1, margin: "0 0 12px",
              color: "white",
              textShadow: "0 2px 30px rgba(0,0,0,0.8)",
            }}>
              THE CROWN<br />
              <span style={{ color: "#FF2DAA", textShadow: "0 0 30px rgba(255,45,170,0.6)" }}>
                NEVER RESTS
              </span>
            </h1>
            <p style={{
              fontSize: 13, color: "rgba(255,255,255,0.6)", margin: "0 0 20px",
              lineHeight: 1.6, maxWidth: 340,
            }}>
              This season&apos;s biggest competitors, the battles that defined the charts, and one artist who changed everything.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <Link href="/magazine" style={{
                display: "inline-block",
                background: "#FF2DAA",
                color: "white", fontSize: 11, fontWeight: 900,
                letterSpacing: "0.15em", padding: "10px 24px",
                borderRadius: 4, textDecoration: "none",
                textTransform: "uppercase",
              }}>
                Read Issue →
              </Link>
              <Link href="/articles" style={{
                display: "inline-block",
                border: "1px solid rgba(255,45,170,0.4)",
                color: "#FF2DAA", fontSize: 11, fontWeight: 700,
                letterSpacing: "0.1em", padding: "10px 20px",
                borderRadius: 4, textDecoration: "none",
                textTransform: "uppercase",
              }}>
                All Articles
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── ARTICLE TEASERS ── */}
      <div style={{ padding: "28px 24px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <SectionTitle title="Inside This Issue" accent="pink" badge={`April 2026 · ${source === "live" ? "Live" : "Fallback"}`} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {articles.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              whileHover={{ y: -4 }}
              style={{
                background: "#0D0A14",
                border: `1px solid ${CAT_COLORS[a.category] ?? "#FF2DAA"}25`,
                borderRadius: 10, padding: 18,
                cursor: "pointer",
              }}
            >
              <div style={{
                fontSize: 9, fontWeight: 900, letterSpacing: "0.2em",
                color: CAT_COLORS[a.category] ?? "#FF2DAA",
                marginBottom: 8,
              }}>
                {a.category}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "white", lineHeight: 1.45 }}>
                {a.slug ? (
                  <Link href={`/articles/${a.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                    {a.title}
                  </Link>
                ) : a.title}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
