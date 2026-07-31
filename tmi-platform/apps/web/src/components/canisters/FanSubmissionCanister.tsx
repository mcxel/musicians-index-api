"use client";

/**
 * FanSubmissionCanister — Rule 26 Fan lane only.
 * YoPho / Snips / Fan Contests / Spotlight / Event participation.
 * NO BeatLocker, NO radio artist submit, NO performer releases.
 */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import DrawerBezelChrome from "@/components/drawers/DrawerBezelChrome";

export type FanSubmissionLane =
  | "yopho"
  | "snips"
  | "fan_contest"
  | "spotlight"
  | "event";

type FanRow = {
  id: string;
  title: string;
  type: string;
  status: string;
  createdAt: number;
};

const LANES: {
  id: FanSubmissionLane;
  label: string;
  type: string;
  href: string;
  hint: string;
}[] = [
  {
    id: "yopho",
    label: "YoPho showcase",
    type: "video",
    href: "/fan/canvas",
    hint: "Canvas / portrait entry",
  },
  {
    id: "snips",
    label: "Snips",
    type: "video",
    href: "/live/lobby",
    hint: "Short clip participation",
  },
  {
    id: "fan_contest",
    label: "Fan contests",
    type: "show",
    href: "/home/5",
    hint: "Arena contest entry",
  },
  {
    id: "spotlight",
    label: "Spotlight",
    type: "video",
    href: "/home/1-2",
    hint: "Discovery spotlight",
  },
  {
    id: "event",
    label: "Event participation",
    type: "show",
    href: "/live/lobby",
    hint: "Join scheduled fan events",
  },
];

interface FanSubmissionCanisterProps {
  userId: string;
  displayName?: string;
  accentColor?: string;
}

export default function FanSubmissionCanister({
  userId,
  displayName = "Fan",
  accentColor = "#FF2DAA",
}: FanSubmissionCanisterProps) {
  const [lane, setLane] = useState<FanSubmissionLane>("yopho");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<FanRow[]>([]);

  const selected = LANES.find((l) => l.id === lane) ?? LANES[0]!;

  const refresh = useCallback(async () => {
    if (!userId || userId === "anonymous") {
      setRows([]);
      return;
    }
    try {
      const res = await fetch(
        `/api/submissions?submitterId=${encodeURIComponent(userId)}&limit=20`,
        { credentials: "include" },
      );
      const data = (await res.json()) as { submissions?: FanRow[] };
      const list = Array.isArray(data.submissions) ? data.submissions : [];
      setRows(
        list.filter((s) => ["video", "show", "comedy", "dance"].includes(s.type)),
      );
    } catch {
      setRows([]);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!userId || userId === "anonymous") {
      setError("Log in as a Fan to submit.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          submitterId: userId,
          title: title.trim() || `${selected.label} — ${displayName}`,
          type: selected.type,
          url: url.trim() || selected.href,
          genre: "Fan",
          description: `Fan lane: ${selected.id}`,
          tags: ["fan", selected.id],
        }),
      });
      const data = (await res.json()) as { error?: string; submissionId?: string };
      if (!res.ok) {
        setError(
          data.error === "quota_exceeded"
            ? "Pending submission limit reached (max 5)."
            : data.error ?? "Submit failed",
        );
        setBusy(false);
        return;
      }
      setMessage(`Queued for ${selected.label}. Open the destination to finish.`);
      setTitle("");
      setUrl("");
      void refresh();
    } catch {
      setError("Unable to reach submissions service.");
    }
    setBusy(false);
  };

  return (
    <DrawerBezelChrome variant="chrome" seriesLabel="Fan Submissions" accentColor={accentColor}>
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.2em", fontWeight: 800, color: accentColor }}>
          FAN ENTRIES · NO BEAT LOCKER · NO ARTIST RADIO SUBMIT
        </div>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <select
            value={lane}
            onChange={(e) => setLane(e.target.value as FanSubmissionLane)}
            style={fieldStyle}
          >
            {LANES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label} — {l.hint}
              </option>
            ))}
          </select>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Entry title"
            style={fieldStyle}
          />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Optional media / page URL"
            style={fieldStyle}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <button type="submit" disabled={busy} style={btnStyle(accentColor)}>
              {busy ? "QUEUING…" : "QUEUE ENTRY"}
            </button>
            <Link href={selected.href} style={linkStyle(accentColor)}>
              Open {selected.label} →
            </Link>
          </div>
        </form>

        {error ? <p style={{ margin: 0, fontSize: 11, color: "#FF6B9A" }}>{error}</p> : null}
        {message ? <p style={{ margin: 0, fontSize: 11, color: "#00FF88" }}>{message}</p> : null}

        {rows.length === 0 ? (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>No fan submissions yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
            {rows.map((s) => (
              <div
                key={s.id}
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{s.title}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                  {s.type} · {s.status} ·{" "}
                  <span style={{ color: accentColor }}>
                    {new Date(s.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DrawerBezelChrome>
  );
}

const fieldStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 6,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#fff",
  fontSize: 11,
};

function btnStyle(color: string): React.CSSProperties {
  return {
    padding: "8px 14px",
    borderRadius: 6,
    border: "none",
    background: color,
    color: "#050310",
    fontSize: 10,
    fontWeight: 900,
    cursor: "pointer",
  };
}

function linkStyle(color: string): React.CSSProperties {
  return {
    fontSize: 10,
    fontWeight: 800,
    color,
    textDecoration: "none",
  };
}
