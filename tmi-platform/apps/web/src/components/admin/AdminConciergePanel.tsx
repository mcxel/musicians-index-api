"use client";

/**
 * AdminConciergePanel — searchable structured grid of admin destinations.
 * Replaces the congested horizontal Admin Quick Switch oval bar.
 */

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  ADMIN_CONCIERGE_DESTINATIONS,
  CONCIERGE_GROUP_ORDER,
  OVERSEER_WORKSPACE_DESTINATIONS,
  filterConciergeDestinations,
  type ConciergeDestination,
  type ConciergeGroup,
} from "@/components/admin/AdminConciergeDestinations";

export type AdminConciergePanelProps = {
  open: boolean;
  onClose: () => void;
  /** Include Overseer workspace role destinations */
  includeWorkspaces?: boolean;
  /** Operator label for Suggest Fix / Limited Controls chip */
  operatorLabel?: string;
  fullControl?: boolean;
  canAutoApplyFixes?: boolean;
  onSuggestFix?: () => void | Promise<void>;
  submittingFix?: boolean;
};

export default function AdminConciergePanel({
  open,
  onClose,
  includeWorkspaces = true,
  operatorLabel = "Admin",
  fullControl = false,
  canAutoApplyFixes = false,
  onSuggestFix,
  submittingFix = false,
}: AdminConciergePanelProps) {
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const catalog = useMemo(() => {
    const base = includeWorkspaces
      ? [...ADMIN_CONCIERGE_DESTINATIONS, ...OVERSEER_WORKSPACE_DESTINATIONS]
      : ADMIN_CONCIERGE_DESTINATIONS;
    return filterConciergeDestinations(base, query);
  }, [includeWorkspaces, query]);

  const byGroup = useMemo(() => {
    const map = new Map<ConciergeGroup, ConciergeDestination[]>();
    for (const group of CONCIERGE_GROUP_ORDER) map.set(group, []);
    for (const dest of catalog) {
      const list = map.get(dest.group) ?? [];
      list.push(dest);
      map.set(dest.group, list);
    }
    return map;
  }, [catalog]);

  if (!open || !mounted) return null;

  const handleAction = async (dest: ConciergeDestination) => {
    if (dest.action === "suggest-fix") {
      await onSuggestFix?.();
      onClose();
      return;
    }
    onClose();
  };

  return createPortal(
    <div
      data-admin-concierge-overlay
      role="dialog"
      aria-modal="true"
      aria-label="Admin Concierge"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(2, 2, 10, 0.72)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: "16px 12px 28px",
      }}
      onClick={onClose}
    >
      <div
        data-admin-concierge-panel
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(920px, 100%)",
          maxHeight: "min(78vh, 820px)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          borderRadius: 16,
          border: "2px solid #D4AF37",
          background: "linear-gradient(180deg, #1a0f16 0%, #0a050c 100%)",
          boxShadow:
            "0 24px 60px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,215,0,0.2), inset 0 0 40px rgba(255,215,0,0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "14px 16px",
            borderBottom: "1px solid rgba(212,175,55,0.35)",
            background: "linear-gradient(180deg, rgba(43,24,34,0.95), rgba(21,9,16,0.98))",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.22em",
                color: "#FFD700",
                textTransform: "uppercase",
              }}
            >
              Admin Concierge
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
              Searchable destinations — replaces the top oval switcher
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: fullControl ? "#FFD700" : "rgba(255,255,255,0.5)",
                border: `1px solid ${fullControl ? "rgba(255,215,0,0.35)" : "rgba(255,255,255,0.12)"}`,
                borderRadius: 999,
                padding: "5px 10px",
              }}
            >
              {operatorLabel}: {fullControl ? "Full Control" : "Limited Controls"}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Admin Concierge"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1.5px solid #D4AF37",
                background: "rgba(0,0,0,0.35)",
                color: "#ffe3a3",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        <div style={{ padding: "12px 16px 8px" }}>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search admin destinations…"
            style={{
              width: "100%",
              boxSizing: "border-box",
              borderRadius: 10,
              border: "1.5px solid rgba(212,175,55,0.45)",
              background: "rgba(0,0,0,0.45)",
              color: "#fff",
              padding: "10px 14px",
              fontSize: 13,
              fontWeight: 600,
              outline: "none",
            }}
          />
        </div>

        <div style={{ overflowY: "auto", padding: "4px 16px 18px", flex: 1 }}>
          {catalog.length === 0 ? (
            <div
              style={{
                padding: "28px 12px",
                textAlign: "center",
                color: "rgba(255,255,255,0.45)",
                fontSize: 12,
              }}
            >
              No destinations match “{query}”.
            </div>
          ) : (
            CONCIERGE_GROUP_ORDER.map((group) => {
              const items = byGroup.get(group) ?? [];
              if (items.length === 0) return null;
              return (
                <section key={group} style={{ marginTop: 14 }}>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 900,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "rgba(255,215,0,0.7)",
                      marginBottom: 8,
                    }}
                  >
                    {group}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                      gap: 8,
                    }}
                  >
                    {items.map((dest) => {
                      const accent = dest.accent ?? "#FFD700";
                      const tileStyle: CSSProperties = {
                        display: "block",
                        padding: "12px 12px",
                        borderRadius: 12,
                        border: `1.5px solid ${accent}55`,
                        background: `linear-gradient(180deg, ${accent}14, rgba(0,0,0,0.35))`,
                        color: accent,
                        fontSize: 11,
                        fontWeight: 900,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        textDecoration: "none",
                        cursor: "pointer",
                        textAlign: "left" as const,
                        width: "100%",
                        boxSizing: "border-box" as const,
                      };

                      if (dest.href) {
                        return (
                          <Link
                            key={dest.id}
                            href={dest.href}
                            onClick={() => onClose()}
                            style={tileStyle}
                          >
                            {dest.label}
                          </Link>
                        );
                      }

                      return (
                        <button
                          key={dest.id}
                          type="button"
                          disabled={submittingFix && dest.action === "suggest-fix"}
                          onClick={() => {
                            void handleAction(dest);
                          }}
                          style={{
                            ...tileStyle,
                            opacity: submittingFix && dest.action === "suggest-fix" ? 0.6 : 1,
                          }}
                        >
                          {submittingFix && dest.action === "suggest-fix"
                            ? "Submitting…"
                            : canAutoApplyFixes && dest.action === "suggest-fix"
                              ? "Auto Fix Intake"
                              : dest.label}
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
