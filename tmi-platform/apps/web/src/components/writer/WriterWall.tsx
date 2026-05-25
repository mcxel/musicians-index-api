"use client";

import { useMemo, useState } from "react";
import type { WriterWorkItem } from "@/types/memory";
import { useMemoryModalStore } from "@/lib/memory/useMemoryModalStore";
import WriterWorkCard from "./WriterWorkCard";

type FilterKind = "all" | WriterWorkItem["kind"];

interface Props {
  writerId: string;
  items: WriterWorkItem[];
}

const FILTERS: { value: FilterKind; label: string }[] = [
  { value: "all",       label: "All" },
  { value: "article",   label: "Articles" },
  { value: "interview", label: "Interviews" },
  { value: "feature",   label: "Features" },
  { value: "review",    label: "Reviews" },
  { value: "past-work", label: "Past Work" },
  { value: "assignment",label: "Assignments" },
  { value: "image",     label: "Images" },
];

export default function WriterWall({ writerId: _writerId, items }: Props) {
  const { open } = useMemoryModalStore();
  const [filter, setFilter] = useState<FilterKind>("all");

  const visible = useMemo(
    () => filter === "all" ? items : items.filter((i) => i.kind === filter),
    [items, filter],
  );

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              padding: "5px 12px",
              borderRadius: 20,
              border: `1px solid ${filter === f.value ? "#FF2DAA" : "rgba(255,255,255,0.1)"}`,
              background: filter === f.value ? "rgba(255,45,170,0.1)" : "transparent",
              color: filter === f.value ? "#FF2DAA" : "rgba(255,255,255,0.4)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.1em",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {f.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Corkboard surface */}
      <div style={{
        background: "linear-gradient(135deg,#1a1208,#0d0c1f)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16,
        padding: "28px 24px 32px",
        position: "relative",
        // Cork grain texture via radial gradient dots
        backgroundImage: [
          "linear-gradient(135deg,#1a1208,#0d0c1f)",
          "radial-gradient(circle at 20% 30%, rgba(180,140,80,0.04) 0%, transparent 50%)",
          "radial-gradient(circle at 80% 70%, rgba(100,80,40,0.03) 0%, transparent 50%)",
        ].join(", "),
      }}>
        {/* Pin rail */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF2DAA", boxShadow: "0 0 6px #FF2DAA" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00FFFF", boxShadow: "0 0 6px #00FFFF" }} />
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FFD700", boxShadow: "0 0 6px #FFD700" }} />
          <div style={{ fontSize: 9, letterSpacing: "0.3em", color: "rgba(255,255,255,0.2)", marginLeft: 8 }}>
            EDITORIAL DESK — {visible.length} ITEM{visible.length !== 1 ? "S" : ""}
          </div>
        </div>

        {visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
            No {filter === "all" ? "work items" : filter.replace("-", " ")} yet.
          </div>
        ) : (
          /* Masonry-style scattered layout */
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px 16px",
            alignItems: "flex-start",
          }}>
            {visible.map((item) => (
              <WriterWorkCard
                key={item.id}
                item={item}
                onClick={() => open({ itemType: "writer-work", item })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
