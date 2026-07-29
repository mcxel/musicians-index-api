"use client";

/**
 * MemoryWallMotionGrid — Phase 7.4 motion-native gallery
 *
 * Source of truth: GET /api/memory/collectibles (Prisma MemoryCollectible).
 * Never reads MemoryLedger / WINNER_DECLARED / MATCH_COMPLETED for cards.
 * Honest empty state when no media (Rule 20).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type {
  CollectibleMemoryRecord,
  MemoryCollectibleKind,
} from "@/lib/memory/collectiblesContracts";
import MotionMediaCard from "./MotionMediaCard";
import MemoryCinematicViewer from "./MemoryCinematicViewer";

type FilterKind = "ALL" | MemoryCollectibleKind;

const FILTERS: { id: FilterKind; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "PHOTO", label: "Photos" },
  { id: "VIDEO", label: "Videos" },
  { id: "YOPHO", label: "YoPho" },
  { id: "TICKET", label: "Tickets" },
  { id: "POSTER", label: "Posters" },
  { id: "KEEPSAKE", label: "Keepsakes" },
];

export interface MemoryWallMotionGridProps {
  /** Owner userId — if omitted, API uses session cookie. */
  ownerId?: string;
  accentColor?: string;
  title?: string;
  compact?: boolean;
  /** Max items to request (default 100). */
  take?: number;
}

export default function MemoryWallMotionGrid({
  ownerId,
  accentColor = "#FF2DAA",
  title = "MEMORY WALL",
  compact = false,
  take = 100,
}: MemoryWallMotionGridProps) {
  const reduceMotion = useReducedMotion();
  const [items, setItems] = useState<CollectibleMemoryRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<FilterKind>("ALL");
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({ albums: "0" });
      if (ownerId) params.set("ownerId", ownerId);
      const res = await fetch(`/api/memory/collectibles?${params}`, {
        credentials: "include",
      });
      if (!res.ok) {
        setItems([]);
        setError(true);
        return;
      }
      const data = (await res.json()) as { collectibles?: CollectibleMemoryRecord[] };
      setItems((data.collectibles ?? []).slice(0, take));
    } catch {
      setItems([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [ownerId, take]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!items) return [];
    if (filter === "ALL") return items;
    return items.filter((i) => i.kind === filter);
  }, [items, filter]);

  const openItem = useCallback(
    (item: CollectibleMemoryRecord) => {
      const idx = filtered.findIndex((x) => x.id === item.id);
      if (idx >= 0) setViewerIndex(idx);
    },
    [filtered],
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.28em",
            color: accentColor,
            fontWeight: 800,
          }}
        >
          {title}
        </div>
        <button
          type="button"
          onClick={() => void load()}
          style={{
            background: "none",
            border: `1px solid ${accentColor}33`,
            borderRadius: 6,
            padding: "4px 10px",
            color: "rgba(255,255,255,0.45)",
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.1em",
            cursor: "pointer",
          }}
        >
          REFRESH
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          marginBottom: 14,
          paddingBottom: 2,
        }}
      >
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            style={{
              flexShrink: 0,
              padding: "5px 10px",
              borderRadius: 999,
              border: `1px solid ${filter === f.id ? accentColor : "rgba(255,255,255,0.12)"}`,
              background: filter === f.id ? `${accentColor}18` : "transparent",
              color: filter === f.id ? accentColor : "rgba(255,255,255,0.4)",
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: "0.08em",
              cursor: "pointer",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "36px 16px",
            color: "rgba(255,255,255,0.35)",
            fontSize: 12,
          }}
        >
          Loading memories…
        </div>
      )}

      {!loading && error && (
        <div
          style={{
            textAlign: "center",
            padding: "36px 16px",
            color: "rgba(255,255,255,0.4)",
            fontSize: 12,
          }}
        >
          Unable to load memories.{" "}
          <button
            type="button"
            onClick={() => void load()}
            style={{
              background: "none",
              border: "none",
              color: accentColor,
              cursor: "pointer",
              fontWeight: 800,
              textDecoration: "underline",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            color: "rgba(255,255,255,0.28)",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 10 }}>📸</div>
          <p style={{ fontSize: 13, margin: 0, color: "rgba(255,255,255,0.45)" }}>
            No memories yet. Capture a photo or save a ticket.
          </p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <motion.div
          style={{
            display: "grid",
            gridTemplateColumns: compact
              ? "repeat(auto-fill, minmax(120px, 1fr))"
              : "repeat(auto-fill, minmax(150px, 1fr))",
            gap: compact ? 10 : 16,
          }}
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: reduceMotion ? 0 : 0.06,
              },
            },
          }}
        >
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              variants={{
                hidden: reduceMotion
                  ? { opacity: 1 }
                  : { opacity: 0, y: 16, scale: 0.96 },
                show: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: reduceMotion ? 0 : 0.35 },
                },
              }}
            >
              <MotionMediaCard
                item={item}
                index={i}
                layoutId={`memory-card-${item.id}`}
                onOpen={openItem}
                compact={compact}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {viewerIndex != null && filtered[viewerIndex] && (
        <MemoryCinematicViewer
          items={filtered}
          index={viewerIndex}
          onClose={() => setViewerIndex(null)}
          onIndexChange={setViewerIndex}
        />
      )}
    </div>
  );
}
