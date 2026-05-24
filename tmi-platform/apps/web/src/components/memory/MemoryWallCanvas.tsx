"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MemoryItem } from "@/lib/profiles/MemoryWallEngine";
import {
  generateMemoryLayout,
  canvasHeight,
  type MemoryCardLayout,
} from "@/lib/profiles/MemoryLayoutGenerator";
import MemoryCard from "@/components/memory/MemoryCard";
import { pinMemory, unpinMemory, recordMemoryInteraction } from "@/lib/profiles/MemoryWallEngine";

const COLS = 4;

const DEMO_SEEDS: Omit<MemoryItem, "memoryId" | "displayOrder">[] = [
  { entityId: "demo", entityType: "fan", contentType: "achievement", contentUrl: "", title: "First Battle Win", description: "Took the crown in round 3.", tags: ["battle", "win"], createdAt: Date.now() - 86400000 * 14, source: "system-captured", isPublic: true, likes: 18, shares: 4 },
  { entityId: "demo", entityType: "fan", contentType: "cypher-moment", contentUrl: "", title: "Cypher Night Vol.7", description: "Held it down front row.", tags: ["cypher", "live"], createdAt: Date.now() - 86400000 * 9, source: "user-uploaded", isPublic: true, likes: 31, shares: 7 },
  { entityId: "demo", entityType: "fan", contentType: "ticket-stub", contentUrl: "", title: "Monday Stage — Row B", tags: ["ticket", "stage"], createdAt: Date.now() - 86400000 * 6, source: "system-captured", isPublic: true, likes: 5, shares: 1, pinnedAt: Date.now() - 1000 },
  { entityId: "demo", entityType: "fan", contentType: "photo", contentUrl: "", title: "Backstage Pass Night", tags: ["backstage", "vip"], createdAt: Date.now() - 86400000 * 4, source: "user-uploaded", isPublic: true, likes: 44, shares: 12 },
  { entityId: "demo", entityType: "fan", contentType: "meet-and-greet", contentUrl: "", title: "Met the headliner", tags: ["meet-greet"], createdAt: Date.now() - 86400000 * 3, source: "user-uploaded", isPublic: true, likes: 22, shares: 9 },
  { entityId: "demo", entityType: "fan", contentType: "battle-win", contentUrl: "", title: "3-0 Sweep — Cypher Arena", tags: ["battle", "sweep"], createdAt: Date.now() - 86400000 * 2, source: "system-captured", isPublic: true, likes: 67, shares: 20 },
  { entityId: "demo", entityType: "fan", contentType: "event-attendance", contentUrl: "", title: "Monthly Idol Finale", tags: ["idol", "finale"], createdAt: Date.now() - 86400000 * 1, source: "system-captured", isPublic: true, likes: 11, shares: 2 },
  { entityId: "demo", entityType: "fan", contentType: "screenshot", contentUrl: "", title: "Chat explosion moment", tags: ["social", "chat"], createdAt: Date.now(), source: "user-uploaded", isPublic: true, likes: 8, shares: 3 },
];

function seedId(i: number): string {
  return `demo-${i}-${Date.now()}`;
}

interface MemoryWallCanvasProps {
  entityId: string;
  entityType: "fan" | "artist" | "performer" | "venue";
  initialMemories?: MemoryItem[];
  accentColor?: string;
}

interface ComposerState {
  title: string;
  contentType: MemoryItem["contentType"];
  contentUrl: string;
  description: string;
  isPublic: boolean;
}

const COMPOSER_TYPES: Array<{ value: MemoryItem["contentType"]; label: string }> = [
  { value: "photo",            label: "🖼 Photo"         },
  { value: "video",            label: "🎥 Video"         },
  { value: "screenshot",       label: "📸 Screenshot"    },
  { value: "achievement",      label: "🏆 Achievement"   },
  { value: "cypher-moment",    label: "🎤 Cypher Moment" },
  { value: "meet-and-greet",   label: "🤝 Meet & Greet"  },
  { value: "event-attendance", label: "🎪 Attendance"    },
  { value: "ticket-stub",      label: "🎫 Ticket Stub"   },
];

export default function MemoryWallCanvas({
  entityId,
  entityType,
  initialMemories = [],
  accentColor = "#00FFFF",
}: MemoryWallCanvasProps) {
  const [memories, setMemories] = useState<MemoryItem[]>(initialMemories);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composer, setComposer] = useState<ComposerState>({
    title: "", contentType: "photo", contentUrl: "", description: "", isPublic: true,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(960);

  // Seed demo items if wall is empty
  useEffect(() => {
    if (memories.length === 0) {
      setMemories(
        DEMO_SEEDS.map((s, i) => ({ ...s, memoryId: seedId(i), displayOrder: i }))
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Observe container resize for responsive columns
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width);
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const cols = Math.max(1, Math.min(COLS, Math.floor(containerWidth / 240)));
  const layout: MemoryCardLayout[] = useMemo(
    () => generateMemoryLayout(memories, cols),
    [memories, cols],
  );
  const height = canvasHeight(memories.length, cols);

  const handleLike = useCallback((memoryId: string) => {
    recordMemoryInteraction(memoryId, "like");
    setMemories(prev =>
      prev.map(m => m.memoryId === memoryId ? { ...m, likes: m.likes + 1 } : m)
    );
  }, []);

  const handlePin = useCallback((memoryId: string) => {
    setMemories(prev => {
      const m = prev.find(x => x.memoryId === memoryId);
      if (!m) return prev;
      if (m.pinnedAt) {
        unpinMemory(memoryId);
        return prev.map(x => x.memoryId === memoryId ? { ...x, pinnedAt: undefined } : x);
      } else {
        pinMemory(memoryId);
        return prev.map(x => x.memoryId === memoryId ? { ...x, pinnedAt: Date.now() } : x);
      }
    });
  }, []);

  const handleAddMemory = useCallback(() => {
    if (!composer.title.trim()) return;
    const newMemory: MemoryItem = {
      memoryId:    `mem-${entityId}-${Date.now()}`,
      entityId,
      entityType,
      contentType:  composer.contentType,
      contentUrl:   composer.contentUrl.trim(),
      title:        composer.title.trim(),
      description:  composer.description.trim() || undefined,
      tags:         [],
      createdAt:    Date.now(),
      source:       "user-uploaded",
      isPublic:     composer.isPublic,
      likes:        0,
      shares:       0,
      displayOrder: memories.length,
    };
    setMemories(prev => [...prev, newMemory]);
    setComposer({ title: "", contentType: "photo", contentUrl: "", description: "", isPublic: true });
    setComposerOpen(false);
  }, [composer, entityId, entityType, memories.length]);

  return (
    <div style={{ width: "100%" }}>
      {/* Filter bar + add button */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", fontWeight: 800 }}>
          {memories.length} MEMORIES
        </div>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setComposerOpen(p => !p)}
          style={{
            padding: "7px 16px", fontSize: 10, fontWeight: 900,
            letterSpacing: "0.1em", cursor: "pointer",
            background: composerOpen ? `${accentColor}22` : "rgba(255,255,255,0.05)",
            border: `1px solid ${composerOpen ? `${accentColor}55` : "rgba(255,255,255,0.1)"}`,
            borderRadius: 20, color: composerOpen ? accentColor : "rgba(255,255,255,0.5)",
          }}
        >
          {composerOpen ? "✕ Cancel" : "+ Add Memory"}
        </button>
      </div>

      {/* Composer */}
      {composerOpen && (
        <div style={{
          marginBottom: 20,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 12, padding: "16px 20px",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em", fontWeight: 800 }}>
            NEW MEMORY
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {COMPOSER_TYPES.map(ct => (
              <button
                key={ct.value}
                onClick={() => setComposer(p => ({ ...p, contentType: ct.value }))}
                style={{
                  padding: "5px 11px", fontSize: 9, fontWeight: 800, cursor: "pointer",
                  background: composer.contentType === ct.value ? `${accentColor}20` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${composer.contentType === ct.value ? `${accentColor}55` : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 6, color: composer.contentType === ct.value ? accentColor : "rgba(255,255,255,0.45)",
                }}
              >
                {ct.label}
              </button>
            ))}
          </div>
          <input
            value={composer.title}
            onChange={e => setComposer(p => ({ ...p, title: e.target.value }))}
            placeholder="Title *"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 12, outline: "none" }}
          />
          <input
            value={composer.contentUrl}
            onChange={e => setComposer(p => ({ ...p, contentUrl: e.target.value }))}
            placeholder="Media URL (optional)"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 12, outline: "none" }}
          />
          <input
            value={composer.description}
            onChange={e => setComposer(p => ({ ...p, description: e.target.value }))}
            placeholder="Caption (optional)"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 12, outline: "none" }}
          />
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
              <input
                type="checkbox"
                checked={composer.isPublic}
                onChange={e => setComposer(p => ({ ...p, isPublic: e.target.checked }))}
                style={{ accentColor }}
              />
              Public
            </label>
            <div style={{ flex: 1 }} />
            <button
              onClick={handleAddMemory}
              disabled={!composer.title.trim()}
              style={{
                padding: "8px 20px", fontSize: 10, fontWeight: 900,
                letterSpacing: "0.1em", cursor: composer.title.trim() ? "pointer" : "not-allowed",
                background: composer.title.trim() ? `${accentColor}22` : "rgba(255,255,255,0.04)",
                border: `1px solid ${composer.title.trim() ? `${accentColor}55` : "rgba(255,255,255,0.07)"}`,
                borderRadius: 8, color: composer.title.trim() ? accentColor : "rgba(255,255,255,0.25)",
              }}
            >
              Save Memory
            </button>
          </div>
        </div>
      )}

      {/* Collage canvas */}
      <div
        ref={containerRef}
        style={{ position: "relative", width: "100%", height, minHeight: 400 }}
      >
        {memories.map(memory => {
          const cardLayout = layout.find(l => l.memoryId === memory.memoryId);
          if (!cardLayout) return null;
          return (
            <MemoryCard
              key={memory.memoryId}
              memory={memory}
              layout={cardLayout}
              onLike={handleLike}
              onPin={handlePin}
            />
          );
        })}
      </div>
    </div>
  );
}
