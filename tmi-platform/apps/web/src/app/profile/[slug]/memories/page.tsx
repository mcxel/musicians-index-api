"use client";

import { useState } from "react";
import MemoryWall from "@/components/memory/MemoryWall";
import HolographicCard from "@/components/memory/HolographicCard";
import MemoryItemModal from "@/components/hub/MemoryItemModal";
import ImageUploader from "@/components/media/ImageUploader";
import type { MemoryItem, ProLegacyItem } from "@/types/memory";

type Tab = "memories" | "ledger";

export default function ProfileMemoriesPage({ params }: { params: { slug: string } }) {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [tab, setTab] = useState<Tab>("memories");
  const [newMemoryTitle, setNewMemoryTitle] = useState("");
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  function onMemoryUploadComplete(url: string) {
    const safeTitle = newMemoryTitle.trim() || "New captured moment";
    const now = new Date();
    const item: MemoryItem = {
      id: `polaroid-${now.getTime()}-${params.slug}`,
      kind: "polaroid",
      title: safeTitle,
      subtitle: "Uploaded to memory wall",
      mediaUrl: url,
      date: now.toLocaleDateString(),
      visibility: "public",
      capturedAt: now.toISOString(),
    };
    setMemories((prev) => [item, ...prev]);
    setNewMemoryTitle("");
    setUploadMsg("Memory added to your wall.");
    setTimeout(() => setUploadMsg(null), 3500);
  }

  const tickets = memories.filter((m) => m.kind === "ticket");
  const polaroids = memories.filter((m) => m.kind === "polaroid");
  const other = memories.filter((m) => m.kind !== "ticket" && m.kind !== "polaroid");

  const tabBtn = (t: Tab, label: string): React.ReactElement => (
    <button
      onClick={() => setTab(t)}
      style={{ padding: "7px 18px", background: tab === t ? "rgba(255,45,170,0.12)" : "transparent", border: `1px solid ${tab === t ? "rgba(255,45,170,0.4)" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, color: tab === t ? "#FF2DAA" : "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 900, cursor: "pointer", letterSpacing: "0.15em" }}
    >
      {label}
    </button>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#050510,#0a0820)", borderBottom: "1px solid rgba(255,45,170,0.12)", padding: "32px 24px 24px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ fontSize: 8, letterSpacing: "0.45em", color: "#FF2DAA", fontWeight: 800, marginBottom: 8 }}>
            MEMORY WALL · @{params.slug}
          </div>
          <h1 style={{ margin: "0 0 16px", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 900, lineHeight: 1.1 }}>
            Experiences &amp; Memories
          </h1>
          <div style={{ display: "flex", gap: 8 }}>
            {tabBtn("memories", "📸 MEMORIES")}
            {tabBtn("ledger", "💼 LEGACY LEDGER")}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>

        {tab === "memories" ? (
          <>
            <section style={{ marginBottom: 34, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,255,255,0.16)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 8, letterSpacing: "0.35em", color: "#00FFFF", fontWeight: 900, marginBottom: 10 }}>ADD NEW MEMORY</div>
              <p style={{ margin: "0 0 12px", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                Upload a real event photo and it will appear instantly in your polaroid wall.
              </p>
              <div style={{ marginBottom: 12 }}>
                <input
                  value={newMemoryTitle}
                  onChange={(e) => setNewMemoryTitle(e.target.value)}
                  placeholder="Memory title (optional)"
                  style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, padding: "10px 12px", color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <ImageUploader context="memory_wall" onUploadComplete={onMemoryUploadComplete} accentColor="#FF2DAA" />
              {uploadMsg && <div style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: "#00FF88" }}>{uploadMsg}</div>}
            </section>
            {tickets.length > 0 && (
              <section style={{ marginBottom: 48 }}>
                <div style={{ fontSize: 8, letterSpacing: "0.35em", color: "#00FF88", fontWeight: 800, marginBottom: 16 }}>🎟️ TICKETS &amp; EVENTS</div>
                <MemoryWall items={tickets} title="TICKETS" />
              </section>
            )}
            {polaroids.length > 0 && (
              <section style={{ marginBottom: 48 }}>
                <div style={{ fontSize: 8, letterSpacing: "0.35em", color: "#FF2DAA", fontWeight: 800, marginBottom: 16 }}>📸 CAPTURED MOMENTS</div>
                <MemoryWall items={polaroids} title="POLAROIDS" />
              </section>
            )}
            {other.length > 0 && (
              <section>
                <div style={{ fontSize: 8, letterSpacing: "0.35em", color: "#FFD700", fontWeight: 800, marginBottom: 16 }}>🏆 COLLECTIBLES &amp; ACHIEVEMENTS</div>
                <MemoryWall items={other} title="COLLECTIBLES" />
              </section>
            )}
          </>
        ) : (
          <>
            <div style={{ fontSize: 9, letterSpacing: "0.35em", color: "rgba(0,200,255,0.7)", fontWeight: 800, marginBottom: 6 }}>PRO LEGACY LEDGER</div>
            <p style={{ margin: "0 0 24px", fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.7 }}>
              Verified impact records generated automatically from sponsorships, ticket sales, and campaigns. Read-only — created by the platform.
            </p>
            <div style={{ textAlign: "center", padding: "48px 24px", color: "rgba(255,255,255,0.2)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💼</div>
              <p style={{ fontSize: 13, margin: 0 }}>No verified impact records yet. Sponsor an event or promote a show to start building your ledger.</p>
            </div>
          </>
        )}
      </div>

      {/* Global modal — mounts here, open from anywhere via memoryModalStore */}
      <MemoryItemModal />
    </main>
  );
}
