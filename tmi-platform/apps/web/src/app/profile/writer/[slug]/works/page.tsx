"use client";

import { useState } from "react";
import Link from "next/link";
import WriterWall from "@/components/writer/WriterWall";
import WriterSubmissionPanel from "@/components/writer/WriterSubmissionPanel";
import ArticleAnalyticsPanel from "@/components/writer/ArticleAnalyticsPanel";
import MemoryItemModal from "@/components/hub/MemoryItemModal";
import { seedWriterWall, getPublicItems, addPortfolioItem } from "@/lib/writer/WriterWallEngine";
import type { WriterWorkKind } from "@/types/memory";

interface Props { params: { slug: string } }

export default function WriterWorksPage({ params }: Props) {
  seedWriterWall(params.slug);
  const [items, setItems] = useState(() => getPublicItems(params.slug));
  const [tab,   setTab]   = useState<"wall" | "analytics">("wall");

  function handleSubmitted(title: string, kind: WriterWorkKind) {
    addPortfolioItem(params.slug, { kind, title, visibility: "public" });
    setItems(getPublicItems(params.slug));
  }

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "36px 20px 80px" }}>
      <MemoryItemModal />
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Breadcrumb */}
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>
          <Link href={`/profile/writer/${params.slug}`} style={{ color: "#FF2DAA", textDecoration: "none" }}>
            {params.slug}
          </Link>
          {" → Works & Portfolio"}
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FF2DAA", fontWeight: 800, marginBottom: 6 }}>WRITER WALL</div>
            <h1 style={{ margin: 0, fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900 }}>
              Published Works & Portfolio
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
              {items.length} item{items.length !== 1 ? "s" : ""} · Articles, interviews, past work, and more
            </p>
          </div>
          <WriterSubmissionPanel writerId={params.slug} onSubmitted={handleSubmitted} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden", width: "fit-content", marginBottom: 24 }}>
          {([["wall", "📌 WORK WALL"], ["analytics", "📊 ANALYTICS"]] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "9px 20px", background: tab === t ? "rgba(255,45,170,0.12)" : "transparent", border: "none", borderRight: t === "wall" ? "1px solid rgba(255,255,255,0.08)" : "none", color: tab === t ? "#FF2DAA" : "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", cursor: "pointer" }}>
              {label}
            </button>
          ))}
        </div>

        {tab === "wall" ? (
          <WriterWall writerId={params.slug} items={items} />
        ) : (
          <ArticleAnalyticsPanel items={items} />
        )}
      </div>
    </main>
  );
}
