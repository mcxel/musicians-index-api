"use client";

/**
 * Bot Activity Switcher — Elder Scrolls NPC–style intel panel.
 * Views: ALL BOTS (live feed) · WHO'S WHO (roster) · NPC JOURNAL (click → dialog).
 * Rule 20: real telemetry from live-switcher + RevenueBusiness reports only.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { LiveSwitcherSubject } from "@/app/api/admin/observatory/live-switcher/route";
import {
  buildActivitySpeechText,
  getLiveSubjects,
  getSelectedLiveSubject,
  selectLiveSubject,
  setLiveSubjects,
  subscribeLiveSubject,
} from "@/lib/admin/ObservatoryLiveSubjectStore";

type ViewMode = "all" | "whos-who" | "journal";

const REVENUE_TEAM = new Set([
  "revenue-business-bot-001",
  "ad-filler-bot-001",
  "sponsor-prospect-bot-001",
  "payout-watcher-bot-001",
  "stripe-health-bot-001",
  "opportunity-scout-bot-001",
]);

function formatAge(ms: number | null | undefined): string {
  if (ms == null || !Number.isFinite(ms)) return "—";
  const ago = Date.now() - ms;
  if (ago < 60_000) return "just now";
  if (ago < 3_600_000) return `${Math.floor(ago / 60_000)}m ago`;
  if (ago < 86_400_000) return `${Math.floor(ago / 3_600_000)}h ago`;
  return `${Math.floor(ago / 86_400_000)}d ago`;
}

function dutyIcon(subject: LiveSwitcherSubject): string {
  if (REVENUE_TEAM.has(subject.id) || subject.id.includes("revenue") || subject.id.includes("stripe")) {
    return "💰";
  }
  if (subject.id.includes("mod")) return "🛡️";
  if (subject.id.includes("hype")) return "🔥";
  if (subject.id.includes("welcome")) return "👋";
  if (subject.id.includes("host")) return "🎤";
  if (subject.id.includes("route") || subject.id.includes("dev")) return "🔧";
  if (subject.id.includes("helper") || subject.id.includes("discovery")) return "🧭";
  if (subject.kind === "human") return "👤";
  return "🤖";
}

function statusColor(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("on-duty") || s === "active" || s.includes("live")) return "#00FF88";
  if (s.includes("suspend") || s.includes("fail") || s.includes("offline")) return "#FF4444";
  if (s.includes("idle") || s.includes("pause")) return "#FFD700";
  return "#00FFFF";
}

function BotPortrait({ subject, size = 72 }: { subject: LiveSwitcherSubject; size?: number }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImg = Boolean(subject.avatarUrl) && !imgFailed;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 12,
        flexShrink: 0,
        border: `2px solid ${statusColor(subject.status)}`,
        boxShadow: `0 0 18px ${statusColor(subject.status)}44`,
        background: "linear-gradient(145deg, rgba(20,10,40,0.95), rgba(5,5,16,0.98))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        fontSize: size * 0.42,
      }}
      aria-hidden
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={subject.avatarUrl!}
          alt=""
          onError={() => setImgFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span>{dutyIcon(subject)}</span>
      )}
    </div>
  );
}

function NpcDialogBox({
  subject,
  onClose,
  voice,
}: {
  subject: LiveSwitcherSubject;
  onClose: () => void;
  voice: boolean;
}) {
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const journal = useMemo(() => {
    const lines = subject.activityLines?.length
      ? subject.activityLines
      : [
          subject.currentTask ? `Current task: ${subject.currentTask}` : "No task reported.",
          subject.lastAction ? `Last action: ${subject.lastAction}` : "No actions logged.",
          subject.currentRoom ? `Location: ${subject.currentRoom}` : "No room bound.",
        ];
    return lines;
  }, [subject]);

  const speech = useMemo(() => buildActivitySpeechText(subject), [subject]);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    utterRef.current = null;
    setSpeaking(false);
  }, []);

  const speak = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    stop();
    const u = new SpeechSynthesisUtterance(speech);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    utterRef.current = u;
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  }, [speech, stop]);

  useEffect(() => () => stop(), [stop]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: 12,
        borderRadius: 14,
        border: "1px solid rgba(255,215,0,0.35)",
        background:
          "linear-gradient(160deg, rgba(12,8,28,0.96) 0%, rgba(5,5,16,0.98) 55%, rgba(20,8,40,0.95) 100%)",
        boxShadow: "0 0 28px rgba(255,45,170,0.12), inset 0 0 40px rgba(0,255,255,0.04)",
        minHeight: 220,
        height: "100%",
      }}
      data-testid="npc-journal-dialog"
    >
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <BotPortrait subject={subject} size={80} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.14em",
              color: "#FFD700",
              textTransform: "uppercase",
            }}
          >
            NPC JOURNAL
            {REVENUE_TEAM.has(subject.id) ? " · REVENUE TEAM" : ""}
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: "#fff",
              marginTop: 4,
              textShadow: "0 0 12px rgba(0,255,255,0.25)",
            }}
          >
            {subject.name}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
            {subject.kind === "bot" ? "[BOT]" : "[HUMAN]"} · {subject.source} ·{" "}
            <span style={{ color: statusColor(subject.status), fontWeight: 800 }}>{subject.status}</span>
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
            Task: {subject.currentTask ?? "none"} · Room: {subject.currentRoom ?? "none"} · Last:{" "}
            {formatAge(subject.lastActionAt)}
          </div>
        </div>
        <button type="button" onClick={onClose} style={chipBtn("#FF2DAA")} title="Back to roster">
          ✕
        </button>
      </div>

      {/* Scrollable dialogue parchment */}
      <div
        style={{
          flex: 1,
          minHeight: 120,
          maxHeight: 280,
          overflowY: "auto",
          borderRadius: 10,
          border: "1px solid rgba(0,255,255,0.22)",
          background: "rgba(0,0,0,0.45)",
          padding: "12px 14px",
          boxShadow: "inset 0 0 24px rgba(0,0,0,0.5)",
        }}
      >
        {journal.length === 0 ? (
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>
            This one has nothing to say right now. (Honest empty — no fabricated journal.)
          </p>
        ) : (
          journal.map((line, i) => (
            <p
              key={`${i}-${line.slice(0, 24)}`}
              style={{
                margin: i === 0 ? 0 : "10px 0 0",
                fontSize: 12,
                lineHeight: 1.55,
                color: i === 0 ? "#ffe9bb" : "rgba(255,255,255,0.72)",
                borderLeft: i === 0 ? "2px solid #FFD700" : "2px solid transparent",
                paddingLeft: 10,
              }}
            >
              {line}
            </p>
          ))
        )}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {(voice || true) && (
          <button type="button" onClick={speaking ? stop : speak} style={chipBtn(speaking ? "#FF4444" : "#AA2DFF")}>
            {speaking ? "Stop voice" : "Hear journal"}
          </button>
        )}
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
          Web Speech · real telemetry only
        </span>
      </div>
    </div>
  );
}

export default function BotActivitySwitcherPanel({ compact = false }: { compact?: boolean }) {
  const [view, setView] = useState<ViewMode>("whos-who");
  const [load, setLoad] = useState<"loading" | "ready" | "error">("loading");
  const [subjects, setLocal] = useState<LiveSwitcherSubject[]>([]);
  const [selected, setSelected] = useState<LiveSwitcherSubject | null>(null);
  const [botsOnly, setBotsOnly] = useState(true);

  const forbiddenRef = useRef(false);

  const loadFeed = useCallback(async () => {
    if (forbiddenRef.current) return;
    try {
      const r = await fetch("/api/admin/observatory/live-switcher", {
        credentials: "include",
        cache: "no-store",
      });
      if (r.status === 403) {
        forbiddenRef.current = true;
        setLoad("error");
        return;
      }
      if (!r.ok) throw new Error(String(r.status));
      const data = (await r.json()) as { subjects?: LiveSwitcherSubject[] };
      const list = Array.isArray(data.subjects) ? data.subjects : [];
      setLiveSubjects(list);
      setLocal(getLiveSubjects());
      setSelected(getSelectedLiveSubject());
      setLoad("ready");
    } catch {
      setLoad("error");
    }
  }, []);

  useEffect(() => {
    void loadFeed();
    const id = setInterval(() => {
      if (!forbiddenRef.current) void loadFeed();
    }, 12_000);
    return () => clearInterval(id);
  }, [loadFeed]);

  useEffect(() => subscribeLiveSubject(() => {
    setLocal(getLiveSubjects());
    setSelected(getSelectedLiveSubject());
  }), []);

  const bots = useMemo(
    () => subjects.filter((s) => s.kind === "bot" || !botsOnly),
    [subjects, botsOnly],
  );

  const feedLines = useMemo(() => {
    const rows = subjects
      .filter((s) => s.kind === "bot")
      .flatMap((s) =>
        (s.activityLines ?? []).slice(0, 2).map((line) => ({
          id: `${s.id}-${line}`,
          botId: s.id,
          name: s.name,
          line,
          at: s.lastActionAt ?? 0,
          revenue: REVENUE_TEAM.has(s.id),
        })),
      )
      .sort((a, b) => (b.at || 0) - (a.at || 0));
    return rows.slice(0, 40);
  }, [subjects]);

  function openJournal(id: string) {
    selectLiveSubject(id);
    setView("journal");
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: compact ? 260 : 320,
        padding: compact ? 8 : 10,
        gap: 8,
        fontFamily: "'Inter', sans-serif",
      }}
      data-testid="bot-activity-switcher"
    >
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        <div
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: "#FFD700",
            marginRight: 4,
          }}
        >
          BOT INTEL
        </div>
        {(
          [
            ["all", "ALL BOTS"],
            ["whos-who", "WHO'S WHO"],
            ["journal", "NPC JOURNAL"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            style={{
              ...chipBtn(view === id ? "#FFD700" : "rgba(255,255,255,0.35)"),
              background: view === id ? "rgba(255,215,0,0.18)" : "rgba(0,0,0,0.35)",
            }}
          >
            {label}
          </button>
        ))}
        <button type="button" onClick={() => void loadFeed()} style={chipBtn("#00FFFF")}>
          Refresh
        </button>
      </div>

      {load === "loading" ? (
        <div style={emptyMsg}>Loading bot telemetry…</div>
      ) : load === "error" ? (
        <div style={{ ...emptyMsg, color: "#ff9b9b" }}>
          Unable to load bots. Confirm admin session.{" "}
          <button type="button" style={chipBtn("#FF2DAA")} onClick={() => void loadFeed()}>
            Retry
          </button>
        </div>
      ) : view === "journal" ? (
        selected ? (
          <NpcDialogBox subject={selected} onClose={() => setView("whos-who")} voice />
        ) : (
          <div style={emptyMsg}>
            Select a bot from Who&apos;s Who to open their journal.
            <div style={{ marginTop: 8 }}>
              <button type="button" style={chipBtn("#FFD700")} onClick={() => setView("whos-who")}>
                Open roster
              </button>
            </div>
          </div>
        )
      ) : view === "all" ? (
        <div style={scrollPane}>
          {feedLines.length === 0 ? (
            <div style={emptyMsg}>No bot activity lines yet. (Honest empty.)</div>
          ) : (
            feedLines.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => openJournal(row.botId)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  background: "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  padding: "8px 4px",
                  cursor: "pointer",
                  color: "#fff",
                }}
              >
                <span style={{ fontSize: 10, fontWeight: 800, color: row.revenue ? "#FFD700" : "#00FFFF" }}>
                  {row.name}
                </span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginLeft: 8 }}>
                  {formatAge(row.at)}
                </span>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2, lineHeight: 1.4 }}>
                  {row.line}
                </div>
              </button>
            ))
          )}
        </div>
      ) : (
        /* WHO'S WHO */
        <div style={{ display: "flex", flexDirection: "column", gap: 6, minHeight: 0, flex: 1 }}>
          <label style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", display: "flex", gap: 6, alignItems: "center" }}>
            <input type="checkbox" checked={botsOnly} onChange={(e) => setBotsOnly(e.target.checked)} />
            Bots only (hide public-live humans)
          </label>
          <div style={scrollPane}>
            {bots.length === 0 ? (
              <div style={emptyMsg}>No bots on roster. (Honest empty.)</div>
            ) : (
              bots.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => openJournal(s.id)}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 6px",
                    borderRadius: 10,
                    border:
                      selected?.id === s.id
                        ? "1px solid rgba(255,215,0,0.55)"
                        : "1px solid rgba(255,255,255,0.08)",
                    background:
                      selected?.id === s.id ? "rgba(255,215,0,0.08)" : "rgba(0,0,0,0.28)",
                    cursor: "pointer",
                    marginBottom: 6,
                    color: "#fff",
                  }}
                >
                  <BotPortrait subject={s} size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 800 }}>
                      {s.name}
                      {REVENUE_TEAM.has(s.id) ? (
                        <span style={{ marginLeft: 6, fontSize: 8, color: "#FFD700" }}>REVENUE</span>
                      ) : null}
                    </div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>
                      {s.kind === "bot" ? "Bot" : "Human"} · {s.source}
                    </div>
                    <div style={{ fontSize: 10, color: statusColor(s.status), fontWeight: 700, marginTop: 2 }}>
                      {s.status}
                      {s.currentTask ? ` · ${s.currentTask}` : ""}
                    </div>
                  </div>
                  <span style={{ fontSize: 9, color: "#FFD700", fontWeight: 800 }}>JOURNAL →</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const emptyMsg: CSSProperties = {
  padding: 16,
  fontSize: 12,
  color: "rgba(255,255,255,0.4)",
  textAlign: "center",
};

const scrollPane: CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  borderRadius: 10,
  border: "1px solid rgba(0,255,255,0.15)",
  background: "rgba(0,0,0,0.25)",
  padding: 6,
};

function chipBtn(color: string): CSSProperties {
  return {
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: "0.06em",
    padding: "5px 10px",
    borderRadius: 8,
    border: `1px solid ${color}`,
    background: `${color}22`,
    color: "#fff",
    cursor: "pointer",
  };
}
