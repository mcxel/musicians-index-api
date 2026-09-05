"use client";

/**
 * YoPho card media composer — side-panel picker (not a new route).
 * Fans: personal playlists / owned tracks / motto.
 * Performers: own catalog via locker APIs. Fans never see Media Locker chrome.
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import PlaylistCardSkinSelector from "@/components/yopho/PlaylistCardSkinSelector";
import {
  FREE_DEFAULT_CHASSIS_ID,
  type MediaPlayerChassisId,
} from "@/lib/artifacts/PlaylistArtifactEngine";
import { getOwnedChassisIds } from "@/lib/artifacts/MediaPlayerInventory";
import {
  canAddYoPhoMediaModule,
  getYoPhoImageCapacity,
  yoPhoMediaCapMessage,
} from "@/lib/yopho/YoPhoImageCapacity";
import {
  YOPHO_MOTTO_DURATION_DEFAULT_SEC,
  YOPHO_MOTTO_DURATION_MAX_SEC,
  YOPHO_MOTTO_DURATION_MIN_SEC,
  clampMottoDurationSec,
  defaultYoPhoMediaModule,
  isYoPhoMediaPlayable,
  type YoPhoMediaAutoplayPolicy,
  type YoPhoMediaModule,
  type YoPhoMediaModulePosition,
  type YoPhoMediaModuleType,
} from "@/lib/yopho/YoPhoMediaModule";
import type { YoPhoCardRole } from "@/lib/yopho/YoPhoCardRegistry";

interface PlaylistRow {
  id: string;
  name: string;
}

interface SongRow {
  id: string;
  title: string;
  audioUrl?: string | null;
  coverUrl?: string | null;
  artistName?: string | null;
}

interface Props {
  role: YoPhoCardRole;
  userKey: string;
  accountTier: string;
  modules: YoPhoMediaModule[];
  onChange: (next: YoPhoMediaModule[]) => void;
}

const inputStyle: CSSProperties = {
  width: "100%",
  background: "#0a0a18",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 8,
  color: "#fff",
  fontSize: 12,
  padding: "8px 10px",
};

function chip(color: string): CSSProperties {
  return {
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: "0.08em",
    color,
    background: `${color}14`,
    border: `1px solid ${color}55`,
    borderRadius: 999,
    padding: "6px 10px",
    cursor: "pointer",
    fontFamily: "inherit",
  };
}

export default function YoPhoMediaModuleComposer({
  role,
  userKey,
  accountTier,
  modules,
  onChange,
}: Props) {
  const capacity = getYoPhoImageCapacity(accountTier);
  const [playlists, setPlaylists] = useState<PlaylistRow[]>([]);
  const [songs, setSongs] = useState<SongRow[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "empty" | "error">("loading");
  const [status, setStatus] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [ownedChassis, setOwnedChassis] = useState<MediaPlayerChassisId[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const stopTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setOwnedChassis(getOwnedChassisIds(userKey));
  }, [userKey]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadState("loading");
      try {
        const contentRes = await fetch("/api/user/content", { credentials: "include", cache: "no-store" });
        const content = contentRes.ok
          ? ((await contentRes.json()) as {
              playlists?: { id: string; name: string }[];
              songs?: { id: string; title: string; audioUrl?: string | null; coverUrl?: string | null }[];
            })
          : { playlists: [], songs: [] };

        let lockerSongs: SongRow[] = [];
        if (role === "performer") {
          const lockerRes = await fetch("/api/media/locker", { credentials: "include", cache: "no-store" });
          if (lockerRes.ok) {
            const locker = (await lockerRes.json()) as {
              items?: { id: string; title: string; type: string; url: string | null }[];
            };
            lockerSongs = (locker.items ?? [])
              .filter((i) => i.type === "songs" && i.url)
              .map((i) => ({ id: i.id, title: i.title, audioUrl: i.url }));
          }
        }

        if (cancelled) return;
        const pls = content.playlists ?? [];
        const contentSongs: SongRow[] = (content.songs ?? []).map((s) => ({
          id: s.id,
          title: s.title,
          audioUrl: s.audioUrl,
          coverUrl: s.coverUrl,
        }));
        const byId = new Map<string, SongRow>();
        for (const s of [...contentSongs, ...lockerSongs]) byId.set(s.id, s);
        const songList = Array.from(byId.values());
        setPlaylists(pls);
        setSongs(songList);
        setLoadState(pls.length || songList.length ? "ready" : "empty");
      } catch {
        if (!cancelled) setLoadState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [role]);

  const patchAt = (index: number, partial: Partial<YoPhoMediaModule>) => {
    const next = modules.map((m, i) => (i === index ? defaultYoPhoMediaModule({ ...m, ...partial }) : m));
    onChange(next);
  };

  const addModule = (type: YoPhoMediaModuleType) => {
    if (!canAddYoPhoMediaModule(modules.length, accountTier)) {
      setStatus(yoPhoMediaCapMessage(accountTier));
      return;
    }
    onChange([
      ...modules,
      defaultYoPhoMediaModule({
        type,
        loop: type === "motto" || type === "audio_snippet",
        endSec: type === "motto" ? YOPHO_MOTTO_DURATION_DEFAULT_SEC : null,
      }),
    ]);
    setStatus(null);
  };

  const removeAt = (index: number) => {
    onChange(modules.filter((_, i) => i !== index));
  };

  const persistMottoFile = useCallback(
    async (file: File, targetIndex: number) => {
      setStatus("Uploading motto…");
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", "YoPho motto");
      fd.append("type", "Audio");
      try {
        const res = await fetch("/api/media/upload", { method: "POST", body: fd, credentials: "include" });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          url?: string;
          assetId?: string;
          error?: string;
        };
        if (res.status === 503 || !data.url) {
          setStatus(data.error ?? "Cloud storage unavailable here (503). Motto not saved.");
          return;
        }
        patchAt(targetIndex, {
          type: "motto",
          sourceId: data.assetId ?? null,
          audioUrl: data.url,
          title: "Personal motto",
          loop: true,
          startSec: 0,
          endSec: YOPHO_MOTTO_DURATION_DEFAULT_SEC,
        });
        setStatus("Motto attached.");
      } catch {
        setStatus("Motto upload failed.");
      }
    },
    [modules],
  );

  const stopRecording = () => {
    if (stopTimerRef.current != null) {
      window.clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    recorderRef.current?.stop();
  };

  const startMottoRecording = async (index: number) => {
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("Recording is not available here — upload an audio file instead.");
      fileRef.current?.click();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "";
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        recorderRef.current = null;
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        const file = new File([blob], "yopho-motto.webm", { type: blob.type || "audio/webm" });
        void persistMottoFile(file, index);
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      setStatus(`Recording motto… max ${YOPHO_MOTTO_DURATION_MAX_SEC}s`);
      stopTimerRef.current = window.setTimeout(stopRecording, YOPHO_MOTTO_DURATION_MAX_SEC * 1000);
    } catch {
      setStatus("Microphone permission denied — upload a file instead.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.14em", color: "#FF2DAA" }}>
        {role === "performer" ? "MEDIA MODULE · OWN CATALOG" : "MEDIA MODULE · PERSONAL PLAYLIST"}
      </div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>
        Optional player on the card — not a pasted Spotify bar. Skin changes do not restart the song.
        Caps: {capacity.maxMediaModules} module{capacity.maxMediaModules === 1 ? "" : "s"} on {capacity.tierKey}.
        One audible source. Video snippets are not on cards this pass (audio only).
      </div>

      {loadState === "loading" ? (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Loading your playlists…</div>
      ) : null}
      {loadState === "error" ? (
        <div style={{ fontSize: 11, color: "#FFD700" }}>Could not load playlists. Sign in and retry.</div>
      ) : null}
      {loadState === "empty" ? (
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          {role === "performer"
            ? "No catalog tracks yet. Upload in Media Locker, then attach here."
            : "No personal playlists or tracks yet. Create a playlist first — nothing fake is shown."}
        </div>
      ) : null}

      {modules.map((mod, index) => (
        <div
          key={mod.id}
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            padding: 10,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            background: "rgba(8,6,20,0.6)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#00E5FF" }}>
              {index === 0 ? "AUDIBLE" : "VISUAL / TAP"} · {mod.type.replace("_", " ").toUpperCase()}
            </span>
            <button type="button" onClick={() => removeAt(index)} style={chip("#FF2DAA")}>
              REMOVE
            </button>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(
              [
                ["playlist", "PLAYLIST"],
                ["album", "ALBUM"],
                ["song", "SONG"],
                ["audio_snippet", "SNIPPET"],
                ["motto", "MOTTO"],
              ] as const
            ).map(([type, label]) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  patchAt(index, {
                    type,
                    loop: type === "motto" || type === "audio_snippet",
                    endSec: type === "motto" ? clampMottoDurationSec(mod.endSec) : mod.endSec,
                  })
                }
                style={chip(mod.type === type ? "#FFD700" : "rgba(255,255,255,0.4)")}
              >
                {label}
              </button>
            ))}
          </div>
          {mod.type === "album" ? (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
              No separate album API — albums attach as a playlist you already own.
            </div>
          ) : null}

          {(mod.type === "playlist" || mod.type === "album") && playlists.length > 0 ? (
            <select
              value={mod.sourceId ?? ""}
              onChange={(e) => {
                const pl = playlists.find((p) => p.id === e.target.value);
                patchAt(index, {
                  sourceId: e.target.value || null,
                  title: pl?.name ?? mod.title,
                  audioUrl: null,
                });
              }}
              style={inputStyle}
            >
              <option value="">Select a playlist…</option>
              {playlists.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          ) : null}

          {(mod.type === "song" || mod.type === "audio_snippet") && songs.length > 0 ? (
            <select
              value={mod.sourceId ?? ""}
              onChange={(e) => {
                const song = songs.find((s) => s.id === e.target.value);
                patchAt(index, {
                  sourceId: e.target.value || null,
                  title: song?.title ?? null,
                  audioUrl: song?.audioUrl ?? null,
                  coverUrl: song?.coverUrl ?? null,
                  artist: song?.artistName ?? null,
                });
              }}
              style={inputStyle}
            >
              <option value="">Select a song…</option>
              {songs.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                  {!s.audioUrl ? " (no audio yet)" : ""}
                </option>
              ))}
            </select>
          ) : null}

          {mod.type === "motto" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => (recording ? stopRecording() : void startMottoRecording(index))}
                  style={chip(recording ? "#FFD700" : "#00FF88")}
                >
                  {recording ? "STOP" : "RECORD MOTTO"}
                </button>
                <button type="button" onClick={() => fileRef.current?.click()} style={chip("#00E5FF")}>
                  UPLOAD CLIP
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void persistMottoFile(file, index);
                    e.target.value = "";
                  }}
                />
              </div>
              <label style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
                Loop length ({YOPHO_MOTTO_DURATION_MIN_SEC}–{YOPHO_MOTTO_DURATION_MAX_SEC}s, default{" "}
                {YOPHO_MOTTO_DURATION_DEFAULT_SEC})
                <input
                  type="number"
                  min={YOPHO_MOTTO_DURATION_MIN_SEC}
                  max={YOPHO_MOTTO_DURATION_MAX_SEC}
                  value={clampMottoDurationSec(mod.endSec)}
                  onChange={(e) =>
                    patchAt(index, { endSec: clampMottoDurationSec(Number(e.target.value)), loop: true })
                  }
                  style={{ ...inputStyle, marginTop: 4, width: 80 }}
                />
              </label>
            </div>
          ) : null}

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(["bottom", "center", "top", "left", "right"] as YoPhoMediaModulePosition[]).map((pos) => (
              <button
                key={pos}
                type="button"
                onClick={() => patchAt(index, { position: pos })}
                style={chip(mod.position === pos ? "#00E5FF" : "rgba(255,255,255,0.35)")}
              >
                {pos.toUpperCase()}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(["muted_until_tap", "attempt", "off"] as YoPhoMediaAutoplayPolicy[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => patchAt(index, { autoplayPolicy: p })}
                style={chip(mod.autoplayPolicy === p ? "#AA2DFF" : "rgba(255,255,255,0.35)")}
              >
                {p === "muted_until_tap" ? "MUTED+TAP" : p.toUpperCase()}
              </button>
            ))}
          </div>

          {!isYoPhoMediaPlayable(mod) ? (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
              No playable source — player stays hidden until a real playlist or Song.audioUrl is attached.
            </div>
          ) : null}

          <PlaylistCardSkinSelector
            accountTier={accountTier}
            ownedChassisIds={ownedChassis}
            compact
            current={{
              chassisId: mod.skinId ?? FREE_DEFAULT_CHASSIS_ID,
              accentOverride: null,
            }}
            onChange={(next) => patchAt(index, { skinId: next.chassisId })}
          />
        </div>
      ))}

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button type="button" onClick={() => addModule("playlist")} style={chip("#00E5FF")}>
          + PLAYLIST
        </button>
        <button type="button" onClick={() => addModule("song")} style={chip("#FFD700")}>
          + SONG
        </button>
        <button type="button" onClick={() => addModule("motto")} style={chip("#00FF88")}>
          + MOTTO
        </button>
      </div>
      {!canAddYoPhoMediaModule(modules.length, accountTier) ? (
        <div style={{ fontSize: 11, color: "#FFD700", lineHeight: 1.4 }}>
          {yoPhoMediaCapMessage(accountTier)}{" "}
          <Link href={capacity.upgradeHref} style={{ color: "#00E5FF" }}>
            Upgrade
          </Link>
        </div>
      ) : null}
      {status ? (
        <div style={{ fontSize: 11, color: "#FFD700", fontWeight: 700 }}>{status}</div>
      ) : null}
    </div>
  );
}
