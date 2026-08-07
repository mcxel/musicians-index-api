"use client";

/**
 * Observatory Bot/Human Live Switcher — roster + dual panes.
 * Screen A: live preview (LobbyPreview / bind — never fake camera).
 * Screen B: activity readout + Web Speech read-aloud.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import LobbyPreviewWindow from "@/components/lobby/LobbyPreviewWindow";
import { buildLobbyPreviewTile } from "@/lib/lobby/LobbyPreviewRuntime";
import { useLobbyPreviewBind } from "@/lib/lobby/useLobbyPreviewBind";
import type { LiveSwitcherSubject } from "@/app/api/admin/observatory/live-switcher/route";
import {
  buildActivitySpeechText,
  getLiveSubjects,
  getSelectedLiveSubject,
  selectLiveSubject,
  setLiveSubjects,
  subscribeLiveSubject,
} from "@/lib/admin/ObservatoryLiveSubjectStore";

export type LiveSwitcherMode = "full" | "roster" | "pov" | "activity" | "voice" | "dual";

type Props = {
  mode?: LiveSwitcherMode;
  compact?: boolean;
  /** Embed in Canister / section slot — skip page chrome */
  embedded?: boolean;
};

type LoadState = "loading" | "ready" | "error";

function SubjectPov({ subject }: { subject: LiveSwitcherSubject }) {
  const roomId = subject.currentRoom ?? "";
  const live = Boolean(subject.currentRoom && subject.roomLive);
  const { mediaStream, bindStatus } = useLobbyPreviewBind(roomId, {
    subscribed: live,
    focused: live,
    isLive: live,
  });

  if (!subject.currentRoom) {
    return (
      <div style={emptyPane}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#FFD700", letterSpacing: "0.12em" }}>NO ROOM BOUND</div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 8, lineHeight: 1.5 }}>
          {subject.kind === "bot" ? "Bot" : "Subject"} has no live room. Task: {subject.currentTask ?? "none"}
        </p>
      </div>
    );
  }

  if (!subject.roomLive) {
    return (
      <div style={emptyPane}>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#00FFFF", letterSpacing: "0.12em" }}>LOCATION ONLY</div>
        <p style={{ fontSize: 13, fontWeight: 800, marginTop: 6 }}>{subject.currentRoom}</p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 8, lineHeight: 1.5 }}>
          Not in GlobalLiveSessionRegistry — no live camera (honest empty). Stay in this panel; use the section switcher for roster / activity.
        </p>
      </div>
    );
  }

  const preview = buildLobbyPreviewTile({
    roomId: subject.currentRoom,
    kind: "live",
    isLive: true,
    hasActivePerformer: Boolean(mediaStream),
  });

  return (
    <div style={{ display: "grid", gap: 8, height: "100%", minHeight: 0 }}>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
        SCREEN A · POV · {subject.currentRoom} · bind {bindStatus}
      </div>
      <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(0,255,255,0.25)", minHeight: 160, flex: 1 }}>
        <LobbyPreviewWindow
          preview={preview}
          accent="#00FFFF"
          performerInitial={subject.name.slice(0, 1).toUpperCase()}
          mediaStream={mediaStream}
          previewUrl={subject.roomPreviewUrl}
        />
      </div>
    </div>
  );
}

function ActivityPane({
  subject,
  voice = false,
}: {
  subject: LiveSwitcherSubject | null;
  voice?: boolean;
}) {
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  const text = useMemo(() => buildActivitySpeechText(subject), [subject]);

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    utterRef.current = null;
    setSpeaking(false);
  }, []);

  const speak = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    stop();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.pitch = 1;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    utterRef.current = u;
    setSpeaking(true);
    window.speechSynthesis.speak(u);
  }, [stop, text]);

  useEffect(() => () => stop(), [stop]);

  const speechOk = typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%", minHeight: 0 }}>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em" }}>
        {voice ? "SCREEN B · VOICE / AUDIO" : "SCREEN B · ACTIVITY READOUT"}
      </div>
      {!subject ? (
        <div style={emptyPane}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
            No subject selected. Pick a launch bot, duty bot, or public-live human.
          </p>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 12, fontWeight: 800 }}>{subject.name}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
            {subject.kind.toUpperCase()} · {subject.source} · {subject.status}
            {subject.labeledAsBot ? " · LABELED BOT" : ""}
          </div>
          <div
            style={{
              flex: 1,
              minHeight: 80,
              overflowY: "auto",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              padding: 10,
              background: "rgba(0,0,0,0.35)",
              fontFamily: "ui-monospace, monospace",
              fontSize: 11,
              lineHeight: 1.55,
              color: "rgba(255,255,255,0.75)",
            }}
          >
            {(subject.activityLines?.length ? subject.activityLines : ["No activity lines yet."]).map((line, i) => (
              <div key={i} style={{ marginBottom: 6 }}>
                {line}
              </div>
            ))}
          </div>
          {(voice || true) && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <button
                type="button"
                onClick={speak}
                disabled={!speechOk}
                style={{
                  ...chipBtn,
                  borderColor: speaking ? "#00FF88" : "rgba(0,255,255,0.4)",
                  color: speaking ? "#00FF88" : "#00FFFF",
                }}
              >
                {speaking ? "● READING…" : "🔊 READ ALOUD"}
              </button>
              <button type="button" onClick={stop} style={chipBtn}>
                STOP
              </button>
              {!speechOk ? (
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                  Web Speech API unavailable — text readout only.
                </span>
              ) : (
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
                  Uses browser TTS of real telemetry — never fake findings.
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function RosterPane({
  subjects,
  selectedId,
  filter,
  query,
  onFilter,
  onQuery,
  onSelect,
  compact,
}: {
  subjects: LiveSwitcherSubject[];
  selectedId: string | null;
  filter: "all" | "bots" | "humans" | "live";
  query: string;
  onFilter: (f: "all" | "bots" | "humans" | "live") => void;
  onQuery: (q: string) => void;
  onSelect: (id: string) => void;
  compact?: boolean;
}) {
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return subjects.filter((s) => {
      if (filter === "bots" && s.kind !== "bot") return false;
      if (filter === "humans" && s.kind !== "human") return false;
      if (filter === "live" && !s.roomLive) return false;
      if (!q) return true;
      return [s.name, s.id, s.source, s.currentRoom ?? "", s.currentTask ?? ""].join(" ").toLowerCase().includes(q);
    });
  }, [subjects, filter, query]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%", minHeight: 0 }}>
      <div style={{ fontSize: 9, letterSpacing: "0.12em", color: "#FF2DAA", fontWeight: 900 }}>
        PUBLIC LIVE · BOT / HUMAN ROSTER
      </div>
      <input
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="Search bots or humans…"
        style={{
          background: "rgba(0,0,0,0.4)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 8,
          padding: "6px 10px",
          color: "#fff",
          fontSize: 11,
          outline: "none",
        }}
      />
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {(["all", "bots", "humans", "live"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => onFilter(f)}
            style={{
              ...chipBtn,
              borderColor: filter === f ? "#00FFFF" : "rgba(255,255,255,0.15)",
              color: filter === f ? "#00FFFF" : "rgba(255,255,255,0.5)",
            }}
          >
            {f}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", display: "grid", gap: 6, minHeight: 0 }}>
        {visible.length === 0 ? (
          <div style={emptyPane}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
              No subjects match. Soft-launch bots activate on load; humans appear only from public live sessions.
            </p>
          </div>
        ) : (
          visible.map((s) => {
            const active = selectedId === s.id;
            const accent = s.kind === "bot" ? "#FF2DAA" : "#00FF88";
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect(s.id)}
                style={{
                  textAlign: "left",
                  border: `1px solid ${active ? accent : "rgba(255,255,255,0.12)"}`,
                  borderRadius: 10,
                  background: active ? `${accent}14` : "rgba(0,0,0,0.32)",
                  padding: compact ? 8 : 10,
                  cursor: "pointer",
                  color: "#fff",
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: compact ? 32 : 40,
                    height: compact ? 32 : 40,
                    borderRadius: "50%",
                    border: `1.5px solid ${accent}`,
                    background: s.avatarUrl
                      ? `url(${s.avatarUrl}) center/cover`
                      : "linear-gradient(135deg,#1a1028,#050510)",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 12,
                    fontWeight: 900,
                    flexShrink: 0,
                  }}
                >
                  {!s.avatarUrl ? s.name.slice(0, 1).toUpperCase() : null}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    {s.kind} · {s.status}
                    {s.roomLive ? " · LIVE" : ""}
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                    {s.currentRoom ?? "no room"} · {s.currentTask ?? "no task"}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function ObservatoryLiveSwitcher({
  mode = "full",
  compact = false,
  embedded = false,
}: Props) {
  const [load, setLoad] = useState<LoadState>("loading");
  const [subjects, setLocalSubjects] = useState<LiveSwitcherSubject[]>([]);
  const [selected, setSelected] = useState<LiveSwitcherSubject | null>(null);
  const [filter, setFilter] = useState<"all" | "bots" | "humans" | "live">("all");
  const [query, setQuery] = useState("");
  const [publicLiveCount, setPublicLiveCount] = useState(0);

  const loadFeed = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/observatory/live-switcher", {
        credentials: "include",
        cache: "no-store",
      });
      if (!r.ok) throw new Error(String(r.status));
      const data = (await r.json()) as {
        ok?: boolean;
        subjects?: LiveSwitcherSubject[];
        publicLiveCount?: number;
      };
      const list = Array.isArray(data.subjects) ? data.subjects : [];
      setLiveSubjects(list);
      setLocalSubjects(getLiveSubjects());
      setSelected(getSelectedLiveSubject());
      setPublicLiveCount(typeof data.publicLiveCount === "number" ? data.publicLiveCount : 0);
      setLoad("ready");
    } catch {
      setLoad("error");
    }
  }, []);

  useEffect(() => {
    void loadFeed();
    const id = setInterval(() => void loadFeed(), 10_000);
    return () => clearInterval(id);
  }, [loadFeed]);

  useEffect(() => {
    return subscribeLiveSubject(() => {
      setLocalSubjects(getLiveSubjects());
      setSelected(getSelectedLiveSubject());
    });
  }, []);

  const shellPad = embedded ? 8 : 14;

  const roster = (
    <RosterPane
      subjects={subjects}
      selectedId={selected?.id ?? null}
      filter={filter}
      query={query}
      onFilter={setFilter}
      onQuery={setQuery}
      onSelect={selectLiveSubject}
      compact={compact}
    />
  );

  const body = (() => {
    if (load === "loading") {
      return <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, padding: 12 }}>Loading live subjects…</p>;
    }
    if (load === "error") {
      return (
        <p style={{ color: "#ff9b9b", fontSize: 12, padding: 12 }}>
          Unable to load switcher. Confirm admin session (requireAdmin).
        </p>
      );
    }
    if (mode === "roster") return roster;
    if (mode === "pov") return selected ? <SubjectPov subject={selected} /> : <div style={emptyPane}>Select a subject from the roster.</div>;
    if (mode === "activity") return <ActivityPane subject={selected} />;
    if (mode === "voice") return <ActivityPane subject={selected} voice />;
    if (mode === "dual") {
      return (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: compact ? "1fr" : "1fr 1fr",
            gap: 10,
            height: "100%",
            minHeight: compact ? 280 : 320,
          }}
        >
          <div style={screenChrome}>{selected ? <SubjectPov subject={selected} /> : <div style={emptyPane}>No subject.</div>}</div>
          <div style={screenChrome}>
            <ActivityPane subject={selected} voice />
          </div>
        </div>
      );
    }
    // full
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: compact ? "1fr" : "minmax(220px,280px) 1fr",
          gap: 12,
          height: "100%",
          minHeight: 0,
        }}
      >
        {roster}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: compact ? "1fr" : "1fr 1fr",
            gap: 10,
            minHeight: 280,
          }}
        >
          <div style={screenChrome}>{selected ? <SubjectPov subject={selected} /> : <div style={emptyPane}>Select a bot or human.</div>}</div>
          <div style={screenChrome}>
            <ActivityPane subject={selected} voice />
          </div>
        </div>
      </div>
    );
  })();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%", padding: shellPad, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {!embedded ? (
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.22em", color: "#FF2DAA", fontWeight: 800 }}>
              OBSERVATORY LIVE SWITCHER
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
              Launch bots · duty bots · public-live humans · Screen A preview · Screen B activity + voice
            </p>
          </div>
        ) : (
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
            {subjects.length} subjects · {publicLiveCount} public live
          </span>
        )}
        <button type="button" onClick={() => void loadFeed()} style={chipBtn}>
          Refresh
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>{body}</div>
    </div>
  );
}

const emptyPane: CSSProperties = {
  border: "1px dashed rgba(255,255,255,0.18)",
  borderRadius: 10,
  padding: 16,
  background: "rgba(255,255,255,0.03)",
  minHeight: 120,
};

const screenChrome: CSSProperties = {
  border: "1px solid rgba(0,255,255,0.22)",
  borderRadius: 12,
  padding: 10,
  background: "rgba(0,0,0,0.4)",
  minHeight: 0,
  overflow: "auto",
};

const chipBtn: CSSProperties = {
  fontSize: 9,
  fontWeight: 800,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  padding: "5px 10px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "transparent",
  color: "rgba(255,255,255,0.7)",
  cursor: "pointer",
  fontFamily: "inherit",
};
