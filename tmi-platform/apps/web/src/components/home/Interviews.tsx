"use client";
import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getHomeEditorial } from "@/components/home/data/getHomeEditorial";

interface InterviewItem {
  name: string; topic: string; genre: string; duration: string; type: string; color: string;
}

const FALLBACK_INTERVIEWS: InterviewItem[] = [
  { name: "Amirah Wells", topic: "Touring, healing, and the next album era", genre: "R&B", duration: "42 min", type: "Video", color: "#FF2DAA" },
  { name: "Traxx Monroe", topic: "Trap production secrets from the studio", genre: "Trap", duration: "28 min", type: "Audio", color: "#00FFFF" },
  { name: "Nova Reign", topic: "How \"Frequencies\" almost didn't get made", genre: "Neo-Soul", duration: "35 min", type: "Written", color: "#AA2DFF" },
];

const COLORS = ["#FF2DAA", "#00FFFF", "#AA2DFF", "#FFD700"];
const TYPES = ["Video", "Audio", "Written"];

export default function Interviews() {
  const [items, setItems] = useState<InterviewItem[]>(FALLBACK_INTERVIEWS);
  const [source, setSource] = useState<"live" | "fallback">("fallback");

  useEffect(() => {
    getHomeEditorial()
      .then((result) => {
        const mapped = result.data.interviews.slice(0, 6).map((article, i) => ({
          name: article.authorName ?? "TMI Staff",
          topic: article.title,
          genre: "Interview",
          duration: `${20 + (i * 7)}min`,
          type: TYPES[i % TYPES.length],
          color: COLORS[i % COLORS.length],
        }));
        setItems(mapped);
        setSource(result.source);
      })
      .catch(() => {});
  }, []);
  return (
    <div style={{
      background: "linear-gradient(135deg, #0A0A12 0%, #0D0D1C 100%)",
      border: "1px solid rgba(0,255,255,0.15)",
      borderRadius: 12, padding: "24px",
    }}>
      <SectionTitle title="Interviews" accent="cyan" badge={`New · ${source === "live" ? "Live" : "Fallback"}`} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((iv, i) => (
          <motion.div key={i}
            whileHover={{ x: 4 }}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "12px 14px", borderRadius: 8,
              background: `${iv.color}08`, border: `1px solid ${iv.color}20`, cursor: "pointer",
            }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 8, background: `linear-gradient(135deg, ${iv.color}30, #0A0A12)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
              {iv.type === "Video" ? "🎬" : iv.type === "Audio" ? "🎙️" : "📝"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 8, color: iv.color, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 2 }}>{iv.type} · {iv.genre}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 2 }}>{iv.name}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{iv.topic}</div>
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{iv.duration}</div>
          </motion.div>
        ))}
      </div>
      <div style={{ marginTop: 14, textAlign: "right" }}>
        <Link href="/articles" style={{ fontSize: 10, color: "#00FFFF", textDecoration: "none", fontWeight: 600 }}>All Interviews →</Link>
      </div>
    </div>
  );
}
