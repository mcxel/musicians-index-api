"use client";

/**
 * ExecutiveOperatorDock — Big Ace + Michael Charlie as reachable admin operators.
 * Host portraits + [BOT] labels (botTransparencyPolicy). Messaging / Ask → host chat API.
 * No fake live video city avatars. No Fan Avatar Studio (Rule 26).
 */

import Link from "next/link";
import { useState } from "react";
import DrawerBezelChrome from "@/components/drawers/DrawerBezelChrome";
import { getHostById, type HostIdentity } from "@/lib/hosts/HostIdentityRegistry";
import {
  assertBotLabel,
  getBotTransparencyStatement,
} from "@/lib/bots/botTransparencyPolicy";

const EXEC_IDS = ["big-ace", "michael-charlie"] as const;

function botDisplayName(host: HostIdentity): string {
  const label = `[BOT] ${host.name}`;
  return assertBotLabel(label) ? label : `[BOT] ${host.shortName}`;
}

interface ExecutiveOperatorDockProps {
  accentColor?: string;
}

export default function ExecutiveOperatorDock({
  accentColor = "#00FFFF",
}: ExecutiveOperatorDockProps) {
  const [activeId, setActiveId] = useState<(typeof EXEC_IDS)[number]>("big-ace");
  const [ask, setAsk] = useState("Give me a brief platform health read.");
  const [reply, setReply] = useState<string | null>(null);
  const [replySource, setReplySource] = useState<"ai" | "static" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const host = getHostById(activeId);
  const label = host ? botDisplayName(host) : "[BOT] Executive";

  const askExecutive = async () => {
    if (!host) return;
    setBusy(true);
    setError(null);
    setReply(null);
    setReplySource(null);
    try {
      const res = await fetch(`/api/hosts/${encodeURIComponent(host.id)}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: ask.trim() || "Status report?" }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        reply?: string;
        source?: "ai" | "static";
        error?: string;
      };
      if (!res.ok || !data.reply) {
        setError(data.error ?? "No reply available. Open Messages for a human thread.");
        setBusy(false);
        return;
      }
      setReply(data.reply);
      setReplySource(data.source ?? "static");
    } catch {
      setError("Host chat unreachable. Use Messages / workspace links below.");
    }
    setBusy(false);
  };

  return (
    <DrawerBezelChrome variant="gold" seriesLabel="Executive Operators" accentColor={accentColor}>
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 9, letterSpacing: "0.18em", fontWeight: 800, color: accentColor }}>
          BIG ACE · MICHAEL CHARLIE · LABELED BOTS · NO FAKE VIDEO CITY
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {EXEC_IDS.map((id) => {
            const h = getHostById(id);
            if (!h) return null;
            const selected = activeId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setActiveId(id);
                  setReply(null);
                  setError(null);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                  border: `1px solid ${selected ? h.colorHex : "rgba(255,255,255,0.12)"}`,
                  background: selected ? `${h.colorHex}18` : "rgba(255,255,255,0.03)",
                  color: "#fff",
                }}
              >
                {h.portraitUrl ? (
                  // Host character portrait (not Fan Avatar Studio — Rule 26)
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={h.portraitUrl}
                    alt={botDisplayName(h)}
                    width={36}
                    height={36}
                    style={{ borderRadius: 6, objectFit: "cover", border: `1px solid ${h.colorHex}66` }}
                  />
                ) : (
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 6,
                      background: `${h.colorHex}33`,
                      display: "grid",
                      placeItems: "center",
                      fontSize: 10,
                      fontWeight: 900,
                      color: h.colorHex,
                    }}
                  >
                    BOT
                  </div>
                )}
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 10, fontWeight: 900 }}>{botDisplayName(h)}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.45)" }}>{h.role}</div>
                </div>
              </button>
            );
          })}
        </div>

        {host ? (
          <>
            <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.5)", lineHeight: 1.45 }}>
              {host.description}
            </p>
            <p style={{ margin: 0, fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
              {getBotTransparencyStatement(label)}
            </p>

            <textarea
              value={ask}
              onChange={(e) => setAsk(e.target.value)}
              rows={2}
              style={{
                ...fieldStyle,
                resize: "vertical",
                minHeight: 56,
              }}
              placeholder={`Ask ${host.shortName}…`}
            />

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <button type="button" disabled={busy} onClick={() => void askExecutive()} style={btnStyle(host.colorHex)}>
                {busy ? "ASKING…" : `Ask ${host.shortName}`}
              </button>
              <Link
                href={`/messages?to=${encodeURIComponent(host.id)}`}
                style={linkStyle("#00FFFF")}
              >
                Open Messages →
              </Link>
              <Link
                href={
                  host.id === "big-ace"
                    ? "/admin/overseer?workspace=bigace"
                    : "/admin/overseer?workspace=michaelcharlie"
                }
                style={linkStyle(accentColor)}
              >
                Workspace →
              </Link>
              <Link
                href={host.id === "big-ace" ? "/admin/big-ace" : "/admin/mc-michael-charlie"}
                style={linkStyle("#AA2DFF")}
              >
                Operator page →
              </Link>
            </div>

            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
              Voice packs / live TTS: not wired as a free-running city. Text reply via host chat
              (AI when available, honest static fallback otherwise).
            </div>

            {error ? <p style={{ margin: 0, fontSize: 11, color: "#FF6B9A" }}>{error}</p> : null}
            {reply ? (
              <div
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: `1px solid ${host.colorHex}44`,
                  background: "rgba(0,0,0,0.35)",
                }}
              >
                <div style={{ fontSize: 8, fontWeight: 800, color: host.colorHex, marginBottom: 4 }}>
                  {label} · {replySource === "ai" ? "AI REPLY" : "STATIC FALLBACK"}
                </div>
                <div style={{ fontSize: 12, color: "#fff", lineHeight: 1.45 }}>{reply}</div>
              </div>
            ) : null}
          </>
        ) : (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
            Executive host identities missing from HostIdentityRegistry.
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
  width: "100%",
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
  return { fontSize: 10, fontWeight: 800, color, textDecoration: "none" };
}
