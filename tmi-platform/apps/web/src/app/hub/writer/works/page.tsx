"use client";

import { useEffect, useState } from "react";
import WriterWall from "@/components/writer/WriterWall";
import WriterSubmissionPanel from "@/components/writer/WriterSubmissionPanel";
import ArticleAnalyticsPanel from "@/components/writer/ArticleAnalyticsPanel";
import MemoryItemModal from "@/components/hub/MemoryItemModal";
import { seedWriterWall, getWorkItems, addPortfolioItem } from "@/lib/writer/WriterWallEngine";
import type { WriterWorkItem, WriterWorkKind } from "@/types/memory";

const WRITER_ID = "current-writer";

export default function WriterHubWorksPage() {
  const [items,    setItems]    = useState<WriterWorkItem[]>([]);
  const [tab,      setTab]      = useState<"wall" | "analytics" | "all">("wall");

  useEffect(() => {
    seedWriterWall(WRITER_ID);
    setItems(getWorkItems(WRITER_ID));
  }, []);

  function refresh() { setItems(getWorkItems(WRITER_ID)); }

  function handleSubmitted(title: string, kind: WriterWorkKind) {
    addPortfolioItem(WRITER_ID, { kind, title, visibility: "public" });
    refresh();
  }

  const visible = tab === "all" ? items : items.filter((i) => i.visibility === "public" && i.status !== "archived");

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "36px 20px 80px" }}>
      <MemoryItemModal />
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        <div style={{ fontSize: 9, letterSpacing: "0.4em", color: "#FF2DAA", fontWeight: 800, marginBottom: 8 }}>HUB — WRITER</div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: "0 0 4px", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900 }}>My Work Wall</h1>
            <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
              Manage your published articles, portfolio items, and assignment credits.
            </p>
          </div>
          <WriterSubmissionPanel writerId={WRITER_ID} onSubmitted={handleSubmitted} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden", width: "fit-content", marginBottom: 24 }}>
          {([["wall", "📌 WALL"], ["analytics", "📊 ANALYTICS"], ["all", "📂 ALL ITEMS"]] as const).map(([t, label], i, arr) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "9px 18px", background: tab === t ? "rgba(255,45,170,0.12)" : "transparent", border: "none", borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none", color: tab === t ? "#FF2DAA" : "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", cursor: "pointer" }}>
              {label}
            </button>
          ))}
        </div>

        {tab === "analytics" ? (
          <ArticleAnalyticsPanel items={items} />
        ) : (
          <WriterWall writerId={WRITER_ID} items={visible} />
        )}
      </div>
    </main>
  );
}
