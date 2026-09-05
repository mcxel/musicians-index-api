"use client";

/**
 * CanonicalQueueDrawer — one queue shell driven by ExperiencePersonality.
 * PERSISTENT: always-on NEXT UP wall (cypher).
 * TRANSIENT: 15s UP NEXT card on advance (battle) then collapses.
 * ROUND_BASED: round queue panel (challenge).
 *
 * Does not invent performers — honest empty when slots [].
 * Reuses CypherQueuePanel for live cypher runtime when available.
 */

import { useEffect, useState } from "react";
import type { ExperiencePersonality } from "@/lib/live/ExperiencePersonality";
import { isPersistentQueue } from "@/lib/live/ExperiencePersonality";
import type { QueueSlot } from "@/lib/live/queueEngine";
import CypherQueuePanel from "@/components/eos/widgets/CypherQueuePanel";

export type CanonicalQueueEntry = {
  id: string;
  displayName: string;
  status: string;
};

export type CanonicalQueueDrawerProps = {
  personality: ExperiencePersonality;
  /** Prefer real queueEngine / runtime slots; empty = honest empty. */
  slots?: readonly (CanonicalQueueEntry | QueueSlot)[];
  /** When true, use CypherRuntime-backed CypherQueuePanel (persistent cypher). */
  useCypherRuntimePanel?: boolean;
  /** Transient card visible after advance — parent sets true on queue advance. */
  showUpNextPulse?: boolean;
  onUpNextDismiss?: () => void;
  accentColor?: string;
  title?: string;
};

function normalizeEntry(slot: CanonicalQueueEntry | QueueSlot): CanonicalQueueEntry {
  if ("displayName" in slot && typeof (slot as CanonicalQueueEntry).displayName === "string") {
    return slot as CanonicalQueueEntry;
  }
  const q = slot as QueueSlot;
  return {
    id: q.slotId,
    displayName: q.performerName,
    status: q.status,
  };
}

function PersistentWall({
  entries,
  accentColor,
  title,
}: {
  entries: CanonicalQueueEntry[];
  accentColor: string;
  title: string;
}) {
  return (
    <div
      style={{
        borderRadius: 10,
        border: `1px solid ${accentColor}44`,
        background: "rgba(5,5,16,0.92)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "8px 12px",
          borderBottom: `1px solid ${accentColor}22`,
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.18em",
          color: accentColor,
        }}
      >
        {title}
      </div>
      <div style={{ padding: 10 }}>
        {entries.length === 0 ? (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
            No one in queue yet.
          </div>
        ) : (
          entries.map((e, i) => (
            <div
              key={e.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 8px",
                marginBottom: 4,
                borderRadius: 8,
                background:
                  e.status === "on-stage" || e.status === "active"
                    ? `${accentColor}18`
                    : "rgba(255,255,255,0.03)",
                border:
                  e.status === "next-up" || e.status === "next"
                    ? `1px solid ${accentColor}55`
                    : "1px solid transparent",
              }}
            >
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", width: 16 }}>
                {i + 1}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{e.displayName}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{e.status}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function TransientUpNextCard({
  next,
  durationMs,
  accentColor,
  onDismiss,
}: {
  next: CanonicalQueueEntry | null;
  durationMs: number;
  accentColor: string;
  onDismiss?: () => void;
}) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    if (durationMs <= 0) return;
    const t = window.setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, durationMs);
    return () => window.clearTimeout(t);
  }, [next?.id, durationMs, onDismiss]);

  if (!visible || !next) return null;

  return (
    <div
      style={{
        padding: "14px 16px",
        borderRadius: 12,
        border: `2px solid ${accentColor}`,
        background: "rgba(5,5,16,0.95)",
        boxShadow: `0 0 24px ${accentColor}33`,
        animation: "tmiUpNextIn 0.35s ease-out",
      }}
    >
      <style>{`@keyframes tmiUpNextIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
      <div
        style={{
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.22em",
          color: accentColor,
          marginBottom: 6,
        }}
      >
        UP NEXT
      </div>
      <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{next.displayName}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
        {Math.round(durationMs / 1000)}s
      </div>
    </div>
  );
}

export default function CanonicalQueueDrawer({
  personality,
  slots = [],
  useCypherRuntimePanel = false,
  showUpNextPulse = false,
  onUpNextDismiss,
  accentColor = "#AA2DFF",
  title,
}: CanonicalQueueDrawerProps) {
  const entries = slots.map(normalizeEntry);
  const next =
    entries.find((e) => e.status === "next-up" || e.status === "next" || e.status === "READY") ??
    entries.find((e) => e.status === "waiting" || e.status === "queued") ??
    null;

  const label =
    title ??
    (personality.id === "BATTLE"
      ? "BATTLE QUEUE"
      : personality.id === "CHALLENGE"
        ? "CHALLENGE QUEUE"
        : "NEXT UP");

  if (useCypherRuntimePanel && isPersistentQueue(personality)) {
    return <CypherQueuePanel />;
  }

  if (personality.queueMode === "TRANSIENT") {
    if (!showUpNextPulse) {
      return (
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", padding: "6px 0" }}>
          Queue collapsed · advances show UP NEXT ({Math.round(personality.upNextCardMs / 1000)}s)
        </div>
      );
    }
    return (
      <TransientUpNextCard
        next={next}
        durationMs={personality.upNextCardMs || 15_000}
        accentColor={accentColor}
        onDismiss={onUpNextDismiss}
      />
    );
  }

  // PERSISTENT + ROUND_BASED → always-visible wall
  return (
    <PersistentWall
      entries={entries}
      accentColor={accentColor}
      title={personality.queueMode === "ROUND_BASED" ? `${label} · ROUND` : label}
    />
  );
}
