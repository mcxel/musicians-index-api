"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SubmissionActivity {
  id: string;
  title: string;
  type: string;
  submitterId: string;
  createdAt: number;
}

interface SubmissionPulseRailProps {
  accentColor?: string;
  title?: string;
  maxItems?: number;
}

function formatAgo(timestamp: number): string {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function SubmissionPulseRail({
  accentColor = "#00FFFF",
  title = "JUST UPLOADED",
  maxItems = 4,
}: SubmissionPulseRailProps) {
  const [items, setItems] = useState<SubmissionActivity[]>([]);

  useEffect(() => {
    const syncFeed = () => {
      try {
        const stored = JSON.parse(localStorage.getItem("tmi_submission_feed") ?? "[]") as SubmissionActivity[];
        const normalized = Array.isArray(stored)
          ? stored
              .filter((entry) => entry && typeof entry.id === "string" && typeof entry.title === "string")
              .sort((a, b) => b.createdAt - a.createdAt)
              .slice(0, maxItems)
          : [];
        setItems(normalized);
      } catch {
        setItems([]);
      }
    };

    const hydrateFromServer = async () => {
      try {
        const response = await fetch(`/api/submissions?public=1&limit=${maxItems}`, { credentials: "include", cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json() as {
          submissions?: Array<{ id: string; title: string; type: string; submitterId: string; createdAt: number }>;
        };
        if (!Array.isArray(data.submissions) || data.submissions.length === 0) return;
        const mapped: SubmissionActivity[] = data.submissions.map((entry) => ({
          id: entry.id,
          title: entry.title,
          type: entry.type,
          submitterId: entry.submitterId,
          createdAt: entry.createdAt,
        }));
        setItems((prev) => (prev.length > 0 ? prev : mapped.slice(0, maxItems)));
      } catch {
        // no-op fallback to local feed
      }
    };

    syncFeed();
    void hydrateFromServer();

    const onSubmissionCreated = () => syncFeed();

    window.addEventListener("storage", syncFeed);
    window.addEventListener("tmi:submission-created", onSubmissionCreated);

    return () => {
      window.removeEventListener("storage", syncFeed);
      window.removeEventListener("tmi:submission-created", onSubmissionCreated);
    };
  }, [maxItems]);

  if (items.length === 0) return null;

  return (
    <section
      style={{
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.03)",
        padding: 12,
      }}
    >
      <div
        style={{
          fontSize: 8,
          fontWeight: 900,
          color: accentColor,
          letterSpacing: "0.14em",
          marginBottom: 10,
        }}
      >
        {title}
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {items.map((entry) => (
          <Link
            key={entry.id}
            href={`/submit/confirm?id=${encodeURIComponent(entry.id)}&title=${encodeURIComponent(entry.title)}&type=${encodeURIComponent(entry.type)}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              textDecoration: "none",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(5,5,16,0.55)",
              padding: "8px 10px",
              gap: 8,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ color: "#fff", fontSize: 11, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {entry.title}
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {entry.type} · {entry.submitterId} · {formatAgo(entry.createdAt)}
              </div>
            </div>
            <div style={{ color: accentColor, fontSize: 9, fontWeight: 900, letterSpacing: "0.1em", flexShrink: 0 }}>
              OPEN ↗
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}