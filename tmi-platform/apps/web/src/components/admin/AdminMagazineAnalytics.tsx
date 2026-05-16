"use client";

import type { AdminSectionId } from "@/lib/adminRouteMap";

type AdminMagazineAnalyticsProps = {
  selectedId: AdminSectionId;
  onSelect: (id: AdminSectionId) => void;
};

export default function AdminMagazineAnalytics({ selectedId, onSelect }: AdminMagazineAnalyticsProps) {
  const active = selectedId === "magazine-analytics";

  return (
    <button
      type="button"
      onClick={() => onSelect("magazine-analytics")}
      data-clickable="true"
      data-section-id="magazine-analytics"
      style={{
        width: "100%",
        textAlign: "left",
        border: active ? "1px solid rgba(56,189,248,0.8)" : "1px solid rgba(56,189,248,0.45)",
        borderRadius: 12,
        background: "linear-gradient(180deg, rgba(7,33,55,0.78), rgba(8,13,24,0.94))",
        padding: 10,
        color: "#dbeafe",
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7dd3fc", fontWeight: 800 }}>
        Musician Index & Magazine Analytics
      </div>
      <div style={{ marginTop: 5, fontSize: 10, color: "#bfdbfe" }}>
        Profiles: 420 · Articles: 136 · Avg Read: 3m 12s · Conversion: 18.4%
      </div>
    </button>
  );
}
