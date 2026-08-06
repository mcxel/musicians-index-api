"use client";

/**
 * Multi-song pick flow before Song Challenge lock-in.
 * Reads real Media Locker songs (/api/media/locker). Honest empty if none (Rule 20).
 */

import { useCallback, useEffect, useState } from "react";
import { SONG_CHALLENGE_SKIN as SKIN } from "@/lib/challenge/SongChallengeSkin";

export interface PickerSong {
  id: string;
  title: string;
  url?: string;
}

interface Props {
  maxSelect?: number;
  side?: "A" | "B";
  onLocked?: (songs: PickerSong[]) => void;
  disabled?: boolean;
}

type LoadState = "loading" | "ready" | "empty" | "error";

export default function SongChallengeSongPicker({
  maxSelect = 3,
  side = "A",
  onLocked,
  disabled = false,
}: Props) {
  const accent = side === "A" ? SKIN.sideA : SKIN.sideB;
  const [songs, setSongs] = useState<PickerSong[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const load = useCallback(async () => {
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/media/locker", { credentials: "include", cache: "no-store" });
      if (!res.ok) {
        setState("error");
        setErrorMsg("Unable to load Media Locker. Retry.");
        return;
      }
      const data = (await res.json()) as {
        items?: Array<{ id: string; title: string; type: string; url?: string }>;
      };
      const list = (data.items ?? [])
        .filter((i) => i.type === "songs")
        .map((i) => ({ id: i.id, title: i.title || "Untitled", url: i.url }));
      setSongs(list);
      setState(list.length === 0 ? "empty" : "ready");
    } catch {
      setState("error");
      setErrorMsg("Unable to load Media Locker. Retry.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function toggle(id: string) {
    if (disabled) return;
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= maxSelect) return prev;
      return [...prev, id];
    });
  }

  function lockIn() {
    if (disabled || selected.length === 0) return;
    const locked = selected
      .map((id) => songs.find((s) => s.id === id))
      .filter((s): s is PickerSong => !!s);
    onLocked?.(locked);
  }

  return (
    <div
      style={{
        background: SKIN.glass,
        border: `1px solid ${accent}44`,
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: "0.16em",
          color: accent,
          marginBottom: 8,
        }}
      >
        PICK YOUR BEST TRACK{maxSelect > 1 ? "S" : ""} · SIDE {side} · {selected.length}/{maxSelect}
      </div>

      {state === "loading" && (
        <div style={{ fontSize: 11, color: SKIN.textMuted }}>Loading Media Locker…</div>
      )}
      {state === "error" && (
        <div>
          <div style={{ fontSize: 11, color: "#FF6B6B", marginBottom: 8 }}>{errorMsg}</div>
          <button
            type="button"
            onClick={() => void load()}
            style={{
              fontSize: 10,
              fontWeight: 800,
              padding: "6px 12px",
              borderRadius: 6,
              border: `1px solid ${accent}`,
              background: `${accent}22`,
              color: accent,
              cursor: "pointer",
            }}
          >
            RETRY
          </button>
        </div>
      )}
      {state === "empty" && (
        <div style={{ fontSize: 11, color: SKIN.textMuted, lineHeight: 1.5 }}>
          No songs in your Media Locker yet. Upload a track to challenge.
        </div>
      )}
      {state === "ready" && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 220, overflowY: "auto" }}>
            {songs.map((song) => {
              const on = selected.includes(song.id);
              return (
                <button
                  key={song.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggle(song.id)}
                  style={{
                    textAlign: "left",
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: `1px solid ${on ? accent : "rgba(255,255,255,0.1)"}`,
                    background: on ? `${accent}22` : "rgba(255,255,255,0.03)",
                    color: "#fff",
                    cursor: disabled ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{on ? "✓ " : ""}{song.title}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            disabled={disabled || selected.length === 0}
            onClick={lockIn}
            style={{
              marginTop: 12,
              width: "100%",
              padding: "10px 0",
              borderRadius: 8,
              border: "none",
              background:
                selected.length === 0
                  ? "rgba(255,255,255,0.08)"
                  : `linear-gradient(90deg, ${accent}, ${SKIN.crown})`,
              color: selected.length === 0 ? SKIN.textMuted : "#050510",
              fontWeight: 900,
              fontSize: 11,
              letterSpacing: "0.12em",
              cursor: selected.length === 0 || disabled ? "not-allowed" : "pointer",
            }}
          >
            LOCK LOADOUT
          </button>
        </>
      )}
    </div>
  );
}
