"use client";

/**
 * LEVEL 3 — YoPho Living Card Studio
 * Asset library · Layer stack · Stage · Properties · Timeline
 */

import { useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  createAndSaveYoPhoLivingProject,
  getActiveYoPhoLivingProject,
  listYoPhoLivingProjects,
  setActiveYoPhoLivingProject,
  getYoPhoLivingPersistenceLabel,
  saveYoPhoLivingProject,
} from "@/lib/yopho/living/YoPhoLivingProjectStore";
import {
  addLayer,
  addMarker,
  addTimedAction,
  addTitlePop,
  applyLayerPosition,
  evaluateLayerAtTime,
  reorderLayer,
  setLayerMotion,
  setLoopPlayback,
  setMasterDuration,
  updateLayer,
  type YoPhoEditScope,
} from "@/lib/yopho/living/YoPhoLivingAuthoring";
import type { YoPhoActionKind, YoPhoLivingProject, YoPhoMarkerKind, YoPhoMotionPresetId } from "@/lib/yopho/living/YoPhoLivingProject";
import {
  supportedActionsForLayer,
  YOPHO_ACTION_KINDS,
  YOPHO_ACTION_TRACKS,
  YOPHO_DURATION_MAX_SEC,
  YOPHO_DURATION_MIN_SEC,
  YOPHO_DURATION_SHORTCUTS,
  YOPHO_MARKER_KINDS,
} from "@/lib/yopho/living/YoPhoLivingProject";
import { YOPHO_LAYOUT_BLUEPRINT } from "@/lib/yopho/living/YoPhoBlueprintCanon";
import YoPhoLivingStage from "./YoPhoLivingStage";

function shownPosition(
  layer: NonNullable<ReturnType<typeof getActiveYoPhoLivingProject>>["layers"][number],
  timeSec: number,
  durationSec: number,
) {
  const ev = evaluateLayerAtTime(layer, timeSec, durationSec);
  return {
    x: layer.transform.position.x + ev.offsetX,
    y: layer.transform.position.y + ev.offsetY,
  };
}

const PRESETS: YoPhoMotionPresetId[] = [
  "NONE", "BOUNCE", "FLOAT", "SWAY", "PULSE", "FLICKER", "GLOW", "SPIN", "DRIFT", "SHAKE", "FLY_BY", "POP",
];

export default function YoPhoLivingStudio({ ownerId = "local" }: { ownerId?: string }) {
  const [tick, setTick] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [timeSec, setTimeSec] = useState(0);
  const [scope, setScope] = useState<YoPhoEditScope>("WHOLE");
  const [durationDraft, setDurationDraft] = useState("");
  const [titleDraft, setTitleDraft] = useState("");
  const [actionKind, setActionKind] = useState<YoPhoActionKind>("RAIN");
  const [stopAt, setStopAt] = useState(27);
  const [actionSpeed, setActionSpeed] = useState(1);
  const [actionRepeat, setActionRepeat] = useState(1);
  const [actionMessage, setActionMessage] = useState("");
  const undoRef = useRef<YoPhoLivingProject[]>([]);
  const projects = useMemo(() => listYoPhoLivingProjects(), [tick]);
  const active = useMemo(() => getActiveYoPhoLivingProject(), [tick]);
  const selected = active?.layers.find((l) => l.layerId === selectedId) ?? active?.layers[0] ?? null;

  const refresh = () => setTick((n) => n + 1);
  const commit = (mutate: (project: YoPhoLivingProject) => YoPhoLivingProject) => {
    if (!active) return;
    undoRef.current = [...undoRef.current, active].slice(-20);
    mutate(active);
    refresh();
  };
  const nudge = (dx: number, dy: number) => {
    if (!active || !selected) return;
    const shown = shownPosition(selected, timeSec, active.durationSec);
    commit((project) => applyLayerPosition(project, selected.layerId, scope, timeSec, {
      x: Math.min(1, Math.max(0, shown.x + dx)),
      y: Math.min(1, Math.max(0, shown.y + dy)),
    }));
  };

  return (
    <div
      data-yopho-living-studio="1"
      data-blueprint={YOPHO_LAYOUT_BLUEPRINT.referenceFile}
      style={{
        display: "grid",
        gridTemplateColumns: "180px 1fr 200px",
        gridTemplateRows: "auto 1fr auto",
        gap: 8,
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        minHeight: 420,
        padding: 10,
        background: "#050510",
        color: "#fff",
        borderRadius: 12,
        border: "1px solid rgba(255,45,170,0.3)",
      }}
    >
      <style>{`@media (max-width: 720px) { [data-yopho-living-studio="1"] { grid-template-columns: minmax(0, 1fr) !important; } }`}</style>
      <div style={{ gridColumn: "1 / -1", display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "space-between", alignItems: "center", minWidth: 0 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.12em", color: "#FF2DAA" }}>YOPHO LIVING CARD STUDIO</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>{getYoPhoLivingPersistenceLabel()}</div>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end", minWidth: 0 }}>
          <button type="button" style={btn} onClick={() => { createAndSaveYoPhoLivingProject({ ownerId, title: "Studio Card", durationSec: 20 }); setTimeSec(0); setPlaying(false); refresh(); }}>NEW</button>
          {YOPHO_DURATION_SHORTCUTS.map((d) => (
            <button
              key={d}
              type="button"
              data-testid={`yopho-duration-${d}`}
              style={{ ...btn, borderColor: active?.durationSec === d ? "#FFD700" : undefined }}
              onClick={() => { if (active) { setMasterDuration(active, d); setTimeSec((current) => Math.min(current, d)); refresh(); } }}
            >
              {d}s
            </button>
          ))}
          <label style={{ fontSize: 9, display: "flex", alignItems: "center", gap: 4 }}>
            SEC
            <input
              data-testid="yopho-duration"
              type="number"
              min={YOPHO_DURATION_MIN_SEC}
              max={YOPHO_DURATION_MAX_SEC}
              step={0.1}
              value={durationDraft || (active ? String(active.durationSec) : "")}
              onChange={(e) => setDurationDraft(e.target.value)}
              onBlur={() => {
                if (!active || durationDraft === "") return;
                const next = setMasterDuration(active, Number(durationDraft));
                setTimeSec((current) => Math.min(current, next.durationSec));
                setDurationDraft("");
                refresh();
              }}
              style={{ width: 64, background: "#0a0a14", color: "#fff", borderRadius: 6, padding: 4 }}
            />
          </label>
        </div>
      </div>

      {/* Asset / project library */}
      <aside style={panel}>
        <div style={label}>MY CARDS</div>
        {projects.map((p) => (
          <button key={p.projectId} type="button" style={{ ...btn, width: "100%", marginBottom: 4, textAlign: "left" }}
            onClick={() => { setActiveYoPhoLivingProject(p.projectId); refresh(); }}>
            {p.title}
          </button>
        ))}
        <div style={{ ...label, marginTop: 10 }}>ADD</div>
        {(["BACKGROUND", "UNDERLAY", "SUBJECT", "OBJECT", "FOREGROUND", "OVERLAY", "TEXT", "LIGHT", "EFFECT"] as const).map((f) => (
          <button key={f} type="button" style={{ ...btn, width: "100%", marginBottom: 3, fontSize: 8 }}
            onClick={() => { if (active) { addLayer(active, f); refresh(); } }}>{f}</button>
        ))}
      </aside>

      {/* Stage */}
      <main style={{ ...panel, display: "flex", flexDirection: "column", gap: 8 }}>
        {active ? (
          <YoPhoLivingStage
            project={active}
            playing={playing}
            loop={active.loopPlayback !== false}
            timeSec={Math.min(timeSec, active.durationSec)}
            onTime={setTimeSec}
            onEnded={() => setPlaying(false)}
          />
        ) : <div style={{ flex: 1, display: "grid", placeItems: "center", opacity: 0.4 }}>NO PROJECT</div>}
        {active ? (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
            <button type="button" data-testid="yopho-play" style={btn} onClick={() => setPlaying(true)}>PLAY</button>
            <button type="button" data-testid="yopho-pause" style={btn} onClick={() => setPlaying(false)}>PAUSE</button>
            <button type="button" data-testid="yopho-restart" style={btn} onClick={() => { setTimeSec(0); setPlaying(true); }}>RESTART</button>
            <button
              type="button"
              data-testid="yopho-loop"
              style={{ ...btn, borderColor: active.loopPlayback !== false ? "#FFD700" : undefined }}
              onClick={() => { setLoopPlayback(active, active.loopPlayback === false); refresh(); }}
            >
              LOOP {active.loopPlayback === false ? "OFF" : "ON"}
            </button>
            <input
              data-testid="yopho-playhead"
              type="range"
              min={0}
              max={active.durationSec}
              step={0.1}
              value={Math.min(timeSec, active.durationSec)}
              onChange={(e) => { setPlaying(false); setTimeSec(Number(e.target.value)); }}
              style={{ flex: "1 1 120px", minWidth: 0 }}
            />
          </div>
        ) : null}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {active?.layers.map((l) => (
            <button key={l.layerId} type="button" style={{ ...btn, borderColor: selected?.layerId === l.layerId ? "#00FFFF" : undefined }}
              onClick={() => setSelectedId(l.layerId)}>
              {l.order}:{l.label}
            </button>
          ))}
        </div>
      </main>

      {/* Properties */}
      <aside style={panel}>
        <div style={label}>PROPERTIES</div>
        {selected && active ? (
          <>
            <div style={{ fontSize: 11, marginBottom: 6 }}>{selected.family} · {selected.label}</div>
            <div style={label}>EDIT SCOPE</div>
            <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
              <button type="button" data-testid="yopho-scope-whole" style={{ ...btn, borderColor: scope === "WHOLE" ? "#FFD700" : undefined }} onClick={() => setScope("WHOLE")}>WHOLE</button>
              <button type="button" data-testid="yopho-scope-time" style={{ ...btn, borderColor: scope === "AT_TIME" ? "#00FFFF" : undefined }} onClick={() => setScope("AT_TIME")}>AT {timeSec.toFixed(1)}s</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, marginBottom: 8 }}>
              <span />
              <button type="button" style={btn} onClick={() => nudge(0, -0.04)}>UP</button>
              <span />
              <button type="button" style={btn} onClick={() => nudge(-0.04, 0)}>LEFT</button>
              <span />
              <button type="button" data-testid="yopho-nudge-right" style={btn} onClick={() => nudge(0.04, 0)}>RIGHT</button>
              <span />
              <button type="button" style={btn} onClick={() => nudge(0, 0.04)}>DOWN</button>
              <span />
            </div>
            <div style={label}>MOTION</div>
            <select
              value={selected.motion.preset}
              onChange={(e) => { setLayerMotion(active, selected.layerId, e.target.value as YoPhoMotionPresetId); refresh(); }}
              style={{ width: "100%", marginBottom: 8, background: "#0a0a14", color: "#fff", borderRadius: 6, padding: 6 }}
            >
              {PRESETS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              <button type="button" style={btn} onClick={() => { reorderLayer(active, selected.layerId, "FORWARD"); refresh(); }}>FWD</button>
              <button type="button" style={btn} onClick={() => { reorderLayer(active, selected.layerId, "BACKWARD"); refresh(); }}>BACK</button>
              <button type="button" style={btn} onClick={() => { reorderLayer(active, selected.layerId, "FRONT"); refresh(); }}>FRONT</button>
              <button type="button" style={btn} onClick={() => { reorderLayer(active, selected.layerId, "BACK"); refresh(); }}>TO BACK</button>
            </div>
            <label style={{ fontSize: 9, display: "block", marginTop: 8 }}>
              Opacity
              <input type="range" min={0} max={1} step={0.05} value={selected.transform.opacity}
                onChange={(e) => {
                  updateLayer(active, selected.layerId, {
                    transform: { ...selected.transform, opacity: Number(e.target.value) },
                  });
                  refresh();
                }} style={{ width: "100%" }} />
            </label>
            <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
              <input
                data-testid="yopho-title-text"
                value={titleDraft}
                placeholder="Title at playhead"
                onChange={(e) => setTitleDraft(e.target.value)}
                style={{ flex: 1, minWidth: 0, background: "#0a0a14", color: "#fff", borderRadius: 6, padding: 4 }}
              />
              <button type="button" data-testid="yopho-add-title" style={btn} onClick={() => {
                const text = titleDraft.trim();
                if (!text) return;
                commit((project) => addTitlePop(project, scope === "AT_TIME" ? timeSec : 0, text));
                setTitleDraft("");
              }}>TEXT</button>
            </div>
            <button type="button" data-testid="yopho-undo" style={{ ...btn, marginTop: 8, width: "100%" }} onClick={() => {
              const prev = undoRef.current.pop();
              if (!prev) return;
              saveYoPhoLivingProject(prev);
              refresh();
            }}>UNDO</button>
          </>
        ) : (
          <div style={{ fontSize: 11, opacity: 0.5 }}>Select a layer</div>
        )}
      </aside>

      {/* Timeline */}
      <div style={{ gridColumn: "1 / -1", ...panel, minHeight: 56 }}>
        <div style={label}>EASY TIMING · ADD ACTION AT {timeSec.toFixed(1)}s</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
          <select data-testid="yopho-action-kind" value={actionKind} onChange={(e) => setActionKind(e.target.value as YoPhoActionKind)} style={{ background: "#0a0a14", color: "#fff", borderRadius: 6, padding: 4 }}>
            {YOPHO_ACTION_KINDS.map((kind) => <option key={kind} value={kind}>{kind}</option>)}
          </select>
          <label style={{ fontSize: 9 }}>START <input data-testid="yopho-action-start" type="number" min={0} max={active?.durationSec ?? 30} step={0.1} value={timeSec} onChange={(e) => { setPlaying(false); setTimeSec(Number(e.target.value)); }} style={{ width: 56, background: "#0a0a14", color: "#fff" }} /></label>
          <label style={{ fontSize: 9 }}>STOP <input data-testid="yopho-action-stop" type="number" min={0.1} max={active?.durationSec ?? 30} step={0.1} value={stopAt} onChange={(e) => setStopAt(Number(e.target.value))} style={{ width: 56, background: "#0a0a14", color: "#fff" }} /></label>
          <label style={{ fontSize: 9 }}>SPEED <input type="number" min={0.1} max={4} step={0.1} value={actionSpeed} onChange={(e) => setActionSpeed(Number(e.target.value))} style={{ width: 48, background: "#0a0a14", color: "#fff" }} /></label>
          <label style={{ fontSize: 9 }}>REPEAT <input type="number" min={1} max={8} step={1} value={actionRepeat} onChange={(e) => setActionRepeat(Number(e.target.value))} style={{ width: 48, background: "#0a0a14", color: "#fff" }} /></label>
          <button type="button" data-testid="yopho-add-action" style={btn} onClick={() => {
            if (!active) return;
            const allowed = actionKind === "CAMERA_ZOOM" || actionKind === "RAIN" || (selected ? supportedActionsForLayer(selected).includes(actionKind) : false);
            if (!allowed && actionKind === "LAYER_MOTION") {
              setActionMessage("This asset has no articulated part. Whole-layer motion needs a prop or object.");
              return;
            }
            const result = addTimedAction(active, {
              kind: actionKind,
              startSec: timeSec,
              endSec: stopAt,
              targetLayerId: selected?.layerId ?? null,
              speed: actionSpeed,
              repeat: actionRepeat,
            });
            setActionMessage(result.accepted ? `${actionKind} at ${timeSec.toFixed(1)}s` : (result.reason ?? "NOT ADDED"));
            refresh();
          }}>ADD ACTION HERE</button>
          {actionMessage ? <span style={{ fontSize: 9, color: "#FFD700" }}>{actionMessage}</span> : null}
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
          {YOPHO_MARKER_KINDS.map((kind) => (
            <button key={kind} type="button" style={btn} onClick={() => { if (active) { addMarker(active, kind as YoPhoMarkerKind, timeSec); refresh(); } }}>{kind}</button>
          ))}
        </div>
        <div style={label}>TIMELINE · {active?.durationSec ?? 0}s MASTER</div>
        {active ? YOPHO_ACTION_TRACKS.map((track) => (
          <div key={track} style={{ display: "grid", gridTemplateColumns: "88px minmax(0, 1fr)", gap: 6, alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: 8, letterSpacing: "0.08em" }}>{track}</span>
            <div style={{ position: "relative", height: 16, background: "rgba(255,255,255,0.04)", borderRadius: 4 }}>
              {track === "AUDIO" ? <span style={{ fontSize: 8, opacity: 0.5, paddingLeft: 4 }}>UNAVAILABLE</span> : null}
              {(active.actions ?? []).filter((action) => action.track === track).map((action) => (
                <button
                  key={action.actionId}
                  type="button"
                  title={`${action.kind} ${action.startSec}-${action.endSec}`}
                  onClick={() => { setPlaying(false); setTimeSec(action.startSec); }}
                  style={{
                    position: "absolute",
                    left: `${(action.startSec / active.durationSec) * 100}%`,
                    width: `${Math.max(2, ((action.endSec - action.startSec) / active.durationSec) * 100)}%`,
                    top: 1,
                    height: 14,
                    border: 0,
                    borderRadius: 3,
                    background: "#FF2DAA",
                    color: "#fff",
                    fontSize: 7,
                    cursor: "pointer",
                  }}
                >{action.kind}</button>
              ))}
            </div>
          </div>
        )) : null}
        <div style={{ display: "flex", gap: 4, overflowX: "auto" }}>
          {active?.layers.map((l) => (
            <div key={l.layerId} style={{
              minWidth: 80, padding: 6, borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.15)", fontSize: 8,
              background: l.motion.preset === "NONE" ? "rgba(255,255,255,0.04)" : "rgba(0,255,255,0.12)",
            }}>
              {l.label}<br />{l.timing.inSec.toFixed(0)}–{l.timing.outSec.toFixed(0)}s · {l.motion.preset}
              {l.timing.hold ? ` · HOLD ${l.timing.hold.startSec}-${l.timing.hold.endSec}` : ""}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const panel: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  padding: 8,
  background: "rgba(0,0,0,0.35)",
  minWidth: 0,
  overflow: "auto",
};

const label: CSSProperties = {
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: "0.1em",
  color: "rgba(255,255,255,0.55)",
  marginBottom: 6,
};

const btn: CSSProperties = {
  padding: "5px 8px",
  borderRadius: 6,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(0,0,0,0.4)",
  color: "#fff",
  fontSize: 9,
  fontWeight: 800,
  cursor: "pointer",
};
